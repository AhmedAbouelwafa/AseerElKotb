import { ChatSource } from "./ChatSource";

export interface ChatMessageResponse {
  answer: string;
  sources: ChatSource[];
  isAvailable?: boolean;
  primaryBookId?: number;
  primaryBookTitle?: string;
  canAddToCart?: boolean;
}
