"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageCircle, Send, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MESSAGE_LIMIT = 20;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // useChat defaults to /api/chat; AI SDK 5 uses sendMessage instead of append
  const { messages, sendMessage, status } = useChat();
  const isLoading = status === "submitted" || status === "streaming";
  const isLimitReached = messages.length >= MESSAGE_LIMIT;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleChatbotSubmit = () => {
    const text = input.trim();
    if (!text || isLoading || isLimitReached) return;
    sendMessage({ text });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatbotSubmit();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <Card
          className={cn(
            // rounded-[10px] bypasses --radius: 3rem which makes rounded-lg = 48px
            // overflow-visible so button shadows aren't clipped at card edges
            "flex h-130 w-105 max-w-[calc(100vw-48px)] flex-col gap-0",
            "overflow-visible rounded-[16px] shadow-xl"
          )}
        >
          {/* Header */}
          <CardHeader className="flex shrink-0 flex-row items-center justify-between border-b px-5 py-2">
            <span className="text-sm font-semibold">Chat</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="size-8 md:size-8 rounded-full"
            >
              <X className="size-4" />
            </Button>
          </CardHeader>

          {/* Messages */}
          <CardContent className="min-h-0 flex-1 px-0 py-0">
            <ScrollArea className="h-full px-5 py-4">
              <div className="flex flex-col gap-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback className="text-xs">
                        {message.role === "user" ? "U" : "AI"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-[16px] px-3 py-2 text-sm leading-relaxed",
                        message.role === "user"
                          ? "max-w-[75%] bg-primary text-primary-foreground"
                          : "max-w-[85%] bg-muted text-foreground"
                      )}
                    >
                      {message.parts.map((part, i) =>
                        part.type === "text" ? (
                          <span key={i} className="whitespace-pre-wrap">
                            {part.text}
                          </span>
                        ) : null
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2">
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback className="text-xs">AI</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1 rounded-[16px] bg-muted px-3 py-2">
                      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input */}
          <CardFooter className="shrink-0 gap-2 border-t bg-transparent p-4">
            {isLimitReached ? (
              <p className="w-full text-center text-xs text-muted-foreground">
                Message limit reached. Please refresh to start a new conversation.
              </p>
            ) : (
              <>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  className="min-h-11 resize-none py-2.5 text-sm"
                  rows={2}
                />
                <Button
                  size="icon"
                  onClick={handleChatbotSubmit}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  className="size-8 md:size-8 rounded-full"
                >
                  <Send className="size-4" />
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Toggle FAB */}
      <Button
        size="icon-lg"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="size-12 rounded-full shadow-lg"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </Button>
    </div>
  );
}
