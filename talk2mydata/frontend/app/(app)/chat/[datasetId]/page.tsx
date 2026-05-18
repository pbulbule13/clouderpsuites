"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { MessageSquare, Sparkles } from "lucide-react";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/api-client";
import type { ChatMessage } from "@/lib/types";

const SUGGESTED_QUESTIONS = [
  "What are the top 10 rows in this dataset?",
  "How many total rows are there?",
  "What is the average of the numeric columns?",
  "Show me a summary breakdown by category.",
];

export default function ChatPage() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    async (question: string) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
      };
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/v1/query/ask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            question,
            dataset_id: datasetId,
            conversation_id: conversationId,
          }),
        });

        if (!response.body) {
          throw new Error("No response body");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
            let event;
            try {
              event = JSON.parse(line.slice(6));
            } catch {
              continue;
            }

            setMessages((prev) => {
              const updated = [...prev];
              const last = { ...updated[updated.length - 1] };
              switch (event.type) {
                case "thinking":
                  last.thinking = event.content;
                  break;
                case "sql":
                  last.sql = event.content;
                  break;
                case "data":
                  last.data = event.data;
                  break;
                case "answer":
                  last.content = event.content;
                  last.thinking = undefined;
                  break;
                case "chart":
                  last.chart = event.data;
                  break;
                case "error":
                  last.content = event.content;
                  last.error = true;
                  last.thinking = undefined;
                  break;
              }
              updated[updated.length - 1] = last;
              return updated;
            });
          }
        }
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: "Something went wrong. Please try again.",
            error: true,
            thinking: undefined,
          };
          return updated;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [datasetId, conversationId]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Ask anything about your data
            </h2>
            <p className="text-muted-foreground mb-6">
              Type a question in plain English and get instant answers with
              tables, charts, and insights.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="text-left text-sm rounded-lg border px-4 py-3 hover:bg-muted transition-colors"
                >
                  <MessageSquare className="h-4 w-4 inline mr-2 text-primary" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t bg-background p-4">
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
