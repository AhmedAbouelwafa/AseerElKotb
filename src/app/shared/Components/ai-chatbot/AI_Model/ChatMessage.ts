import { ChatSource } from "./ChatSource";

export interface ChatMessage {
  question?: string;
  answer?: string;
  isUser: boolean;
  time: string;
  isTyping?: boolean;
  sources?: ChatSource[];
}
