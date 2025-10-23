import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Bot, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AiMessage } from "@shared/schema";

export default function AIAssistant() {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery<AiMessage[]>({
    queryKey: ["/api/ai/messages"],
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/ai/chat", { message: content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/messages"] });
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please make sure OpenAI API key is configured",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  const quickActions = [
    "Analyze my spending patterns",
    "How can I save more money?",
    "Should I invest more in stocks?",
    "Help me create a budget",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Financial Assistant</h1>
        <p className="text-muted-foreground mt-1">
          Get personalized financial advice and insights
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Chat with AI Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 p-0">
              <ScrollArea className="flex-1 px-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                    <Bot className="h-16 w-16 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold text-lg">Welcome to your AI Financial Assistant</h3>
                      <p className="text-muted-foreground mt-2">
                        Ask me anything about your finances, budgeting, or investment strategies.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
                    {messages.map((msg, index) => (
                      <div
                        key={msg.id || index}
                        className={`flex gap-3 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
                            <Bot className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={`rounded-lg px-4 py-3 max-w-[80%] ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                          data-testid={`message-${msg.role}-${index}`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === "user" && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                    {sendMutation.isPending && (
                      <div className="flex gap-3 justify-start">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="rounded-lg px-4 py-3 bg-muted">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              <div className="px-6 pb-6 space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything about your finances..."
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    data-testid="input-ai-message"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!message.trim() || sendMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => {
                    setMessage(action);
                  }}
                  data-testid={`button-quick-action-${index}`}
                >
                  {action}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>💡 Ask about specific spending categories to get detailed insights</p>
              <p>📊 Request investment advice based on your current portfolio</p>
              <p>🎯 Get help setting realistic financial goals</p>
              <p>💰 Learn strategies to reduce expenses and increase savings</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
