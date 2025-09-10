import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../shared/Components/ai-chatbot/AI_Service/chat-service';
import { TranslateModule } from '@ngx-translate/core';

interface GeneratedImage {
  prompt: string;
  url: string;
  timestamp: Date;
  width: number;
  height: number;
  seed?: number;
}

@Component({
  selector: 'app-image-generation',
  imports: [CommonModule, FormsModule , TranslateModule],
  templateUrl: './image-generation.html',
  styleUrl: './image-generation.css'
})
export class ImageGeneration {
  prompt: string = '';
  width: number = 512;
  height: number = 512;
  seed: number | null = null;
  isGenerating: boolean = false;
  generatedImages: GeneratedImage[] = [];
  currentImageUrl: string = '';

  // Predefined size options
  sizeOptions = [
    { label: 'Square (512x512)', width: 512, height: 512 },
    { label: 'Portrait (512x768)', width: 512, height: 768 },
    { label: 'Landscape (768x512)', width: 768, height: 512 },
    { label: 'HD (1024x768)', width: 1024, height: 768 },
    { label: 'Full HD (1920x1080)', width: 1920, height: 1080 }
  ];

  // Popular prompt examples
  promptExamples = [
    'A mysterious old library at night',
    'A brave knight standing on a cliff',
    'A magical potion on a wooden table',
    'A futuristic spaceship landing on Mars',
    'A cozy cottage in a snowy forest'
  ];
  constructor(private chatService: ChatService) {}

  generateImage(): void {
    if (!this.prompt.trim()) {
      alert('من فضلك ادخل وصف للصورة');
      return;
    }

    this.isGenerating = true;

    // Generate image URL
    const imageUrl = this.seed
      ? this.chatService.generateImageWithParams(this.prompt, this.width, this.height, this.seed)
      : this.chatService.generateImageWithParams(this.prompt, this.width, this.height);

    this.currentImageUrl = imageUrl;

    // Add to generated images history
    const newImage: GeneratedImage = {
      prompt: this.prompt,
      url: imageUrl,
      timestamp: new Date(),
      width: this.width,
      height: this.height,
      seed: this.seed || undefined
    };

    this.generatedImages.unshift(newImage);

    // Keep only last 10 images
    if (this.generatedImages.length > 10) {
      this.generatedImages = this.generatedImages.slice(0, 10);
    }

    this.isGenerating = false;
  }

  usePromptExample(example: string): void {
    this.prompt = example;
  }

  setSizePreset(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      const selectedSize = this.sizeOptions.find(size => size.label === target.value);
      if (selectedSize) {
        this.width = selectedSize.width;
        this.height = selectedSize.height;
      }
    }
  }

  downloadImage(imageUrl: string, prompt: string): void {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
    link.click();
  }

  clearHistory(): void {
    this.generatedImages = [];
    this.currentImageUrl = '';
  }

  generateRandomSeed(): void {
    this.seed = Math.floor(Math.random() * 1000000);
  }

  clearSeed(): void {
    this.seed = null;
  }

  copyImageUrl(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      alert('تم نسخ رابط الصورة');
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
    });
  }

  selectImage(image: GeneratedImage): void {
    this.currentImageUrl = image.url;
    this.prompt = image.prompt;
    this.width = image.width;
    this.height = image.height;
    this.seed = image.seed || null;
  }
}
