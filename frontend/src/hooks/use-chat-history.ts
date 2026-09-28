import { useCallback, useEffect, useState } from "react";
import {
  clearConversations,
  newId,
  readConversations,
  writeConversations,
} from "@/lib/storage";
import type { ChatMessage, Conversation } from "@/lib/types";

export function useChatHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setConversations(readConversations());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Conversation[]) => {
    setConversations(next);
    writeConversations(next);
  }, []);

  const createConversation = useCallback((): Conversation => {
    return {
      id: newId(),
      title: "New conversation",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
  }, []);

  const upsertConversation = useCallback(
    (conversation: Conversation) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === conversation.id);
        const next = exists
          ? prev.map((c) => (c.id === conversation.id ? conversation : c))
          : [conversation, ...prev];
        const sorted = [...next].sort((a, b) => b.updatedAt - a.updatedAt);
        writeConversations(sorted);
        return sorted;
      });
    },
    [],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      persist(conversations.filter((c) => c.id !== id));
    },
    [conversations, persist],
  );

  const clearAll = useCallback(() => {
    clearConversations();
    setConversations([]);
  }, []);

  return {
    conversations,
    loaded,
    createConversation,
    upsertConversation,
    deleteConversation,
    clearAll,
  };
}

export function titleFromMessage(message: ChatMessage) {
  const text = message.content.trim();
  return text.length > 48 ? `${text.slice(0, 48)}…` : text || "New conversation";
}
