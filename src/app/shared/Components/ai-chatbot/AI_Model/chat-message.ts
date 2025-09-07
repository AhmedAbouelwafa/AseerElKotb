export interface ChatMessage {
  id: string;
  text: string;
  time: string;
  isUser: boolean;
  isTyping?: boolean;
}
