export type ChatMode = "local-ai" | "retrieval" | "no-match";

export interface ChatSource {
  id: number;
  title: string;
  excerpt: string;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  mode: ChatMode;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  sources?: ChatSource[];
  mode?: ChatMode;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  group: "Academic" | "Campus";
  category: string;
  location: string;
}

export interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
}
