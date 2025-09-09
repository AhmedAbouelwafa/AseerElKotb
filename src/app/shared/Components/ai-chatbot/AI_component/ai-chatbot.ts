import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../AI_Model/ChatMessage';
import { ChatMessageRequest } from '../AI_Model/Chat_Request';
import { ChatMessageResponse } from '../AI_Model/Chat_Response';
import { lastValueFrom } from 'rxjs';
import { ChatService } from '../AI_Service/chat-service';
import { ChatSource } from '../AI_Model/ChatSource';
import { environment } from '../../../../../environments/environment';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule , RouterLink , TranslateModule],
  templateUrl: './ai-chatbot.html',
  styleUrls: ['./ai-chatbot.css']
})
export class AICHATBOT {
  @ViewChild('chatMessages') chatMessagesRef!: ElementRef;

  showModal = false;
  showChat = false;
  showThankYouModal = false;
  showInquiryNotice = false;
  showConfirmationNotice = false;
  hasUnreadMessages = true;
  currentMessage = '';

  messages: ChatMessage[] = [];

  constructor(private chatService: ChatService , private translate: TranslateService) {}



  ngOnInit() {
    setTimeout(() => {
      this.showModal = true;
    }, 1000);

    // Initialize with empty message first
    const welcomeMessage: ChatMessage = {
      answer: '',
      isUser: false,
      time: this.getCurrentTime()
    };
    
    this.messages = [welcomeMessage];
    
    // Set the translated text after initialization
    this.translate.get('AseerAlkotb.welcome').subscribe((value) => {
      if (this.messages.length > 0) {
        this.messages[0].answer = value;
      }
    });
  }

  toggleChat() {
    if (this.showModal) {
      this.closeModal();
    }
    this.showChat = !this.showChat;
    this.hasUnreadMessages = false;

    if (this.showChat) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  closeModal() {
    this.showModal = false;
  }

  minimizeChat() {
    this.showChat = false;
    this.showThankYouModal = true;
  }

  selectOption(option: string) {
    this.showModal = false;
    this.showChat = true;

    this.addMessage(`أريد مساعدة في ${option}`, true);

    setTimeout(() => {
      this.addTypingMessage();

      setTimeout(() => {
        this.removeTypingMessage();
        this.addMessage('بالطبع! سأساعدك في هذا الأمر. دعني أحضر لك المعلومات المطلوبة.', false);

        if (option === 'طلب') {
          this.showInquiryNotice = true;
        }
      }, 2000);
    }, 500);
  }

  startNewChat() {
    this.showModal = false;
    this.showChat = true;
    this.messages = [
      {
        answer: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
        isUser: false,
        time: this.getCurrentTime(),
      }
    ];
    setTimeout(() => this.scrollToBottom(), 100);
  }

  sendMessage() {
    if (!this.currentMessage.trim()) return;

    this.addMessage(this.currentMessage, true);
    const userMessage = this.currentMessage;
    this.currentMessage = '';

    setTimeout(() => {
      this.addTypingMessage();

      setTimeout(() => {
        this.removeTypingMessage();
        this.generateBotResponse(userMessage);
      }, 1500);
    }, 300);
  }

  addMessage(text: string, isUser: boolean, sources?: ChatSource[]) {
    const message: ChatMessage = {
      [isUser ? 'question' : 'answer']: text,
      isUser,
      time: this.getCurrentTime(),
      sources, // Add sources if provided
    };

    this.messages.push(message);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  addTypingMessage() {
    const typingMessage: ChatMessage = {
      isUser: false,
      time: this.getCurrentTime(),
      isTyping: true,
    };

    this.messages.push(typingMessage);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  removeTypingMessage() {
    this.messages = this.messages.filter(msg => !msg.isTyping);
  }

  async generateBotResponse(userMessage: string) {
    const request: ChatMessageRequest = {
      Question: userMessage, // غيّرنا من question إلى Question
      Language: 'ar',
      Category: 'general',
      Limit: 1,
    };

    try {
      const response = await this.callChatAPI(request);
      const botMessage = response.answer || 'شكراً لتواصلك معنا! سأساعدك بأفضل ما لدي.';
      console.log('Response:', response);
      // Normalize sources to expected camelCase keys if backend returns PascalCase
      const apiBase = (environment as any).apiUrlHttps?.replace(/\/$/, '')
        || environment.apiUrl?.replace(/\/$/, '')
        || '';

      const normalizedSources = (response.sources || []).map((s: any) => {
        const cover = s.coverImageUrl ?? s.CoverImageUrl;
        const isAbsolute = typeof cover === 'string' && /^(?:https?:)?\/\//.test(cover);
        const resolvedCover = cover
          ? (isAbsolute ? cover : `${apiBase}${cover.startsWith('/') ? '' : '/'}${cover}`)
          : undefined;

        return {
          bookId: s.bookId ?? s.BookId,
          title: s.title ?? s.Title,
          snippet: s.snippet ?? s.Snippet,
          coverImageUrl: resolvedCover,
        } as ChatSource;
      });

      this.addMessage(botMessage, false, normalizedSources);

      if (response.sources && response.sources.length > 0) {
        console.log('Sources:', response.sources);
      }

      if (Math.random() > 0.5) {
        setTimeout(() => {
          this.showConfirmationNotice = true;
        }, 1000);
      }

      if (this.messages.filter(m => !m.isTyping).length >= 3) {
        setTimeout(() => {
          // this.showThankYouModal = true;
        }, 3000);
      }
    } catch (error: any) {
      console.error('API Error:', error);
      let errorMessage = 'عذراً، فيه مشكلة في الاتصال بالسيرفر. جرب تاني بعد شوية.';
      if (error.status === 0) {
        errorMessage = 'مش عارف أوصل للسيرفر. تأكد إن السيرفر شغال وإن الإنترنت مظبوط.';
      } else if (error.status === 404) {
        errorMessage = 'الـ API مش موجود. ممكن الرابط غلط.';
      }
      this.addMessage(errorMessage, false);
    }
  }

  closeThankYouModal() {
    this.showThankYouModal = false;
  }

  openRating() {
    this.showThankYouModal = false;
    alert('شكراً لك! سيتم فتح نموذج التقييم.');
  }

  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'مساءً' : 'صباحاً';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  scrollToBottom() {
    if (this.chatMessagesRef) {
      const element = this.chatMessagesRef.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  async callChatAPI(request: ChatMessageRequest): Promise<ChatMessageResponse> {
    try {
      const response = await lastValueFrom(this.chatService.callChatAPI(request));
      return response;
    } catch (error) {
      throw error;
    }
  }
}
