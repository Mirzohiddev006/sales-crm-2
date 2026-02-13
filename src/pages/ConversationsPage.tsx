import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  MessageSquare,
  User,
  RefreshCw,
  ArrowLeft,
  Bot,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loading } from "@/components/common/Loading";
import { conversationsService } from "@/services/conversationsService";
import { cn } from "@/lib/utils";

interface Conversation {
  client_id: number | null;
  fullname: string;
  phone: string;
  username: string;
  chatid: number;
  conversation_file: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export function ConversationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConvs, setFilteredConvs] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fayllar ro'yxatini yuklash
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const data = await conversationsService.getAllConversations();
      const rawData = Array.isArray(data) ? data : [];

      const formattedData: Conversation[] = rawData.map((item: any) => {
        if (typeof item === 'string') {
          return {
            client_id: null,
            fullname: "",
            phone: "",
            username: "",
            chatid: 0,
            conversation_file: item
          };
        }
        return item as Conversation;
      }).filter(item => !!item.conversation_file);

      setConversations(formattedData);
      setFilteredConvs(formattedData);

      // URL parametrida file bo'lsa, avtomatik tanlash
      const fileFromQuery = searchParams.get("file");
      if (fileFromQuery) {
        const found = formattedData.find(c => c.conversation_file === fileFromQuery);
        if (found) handleConversationSelect(found);
      }
    } catch (err: any) {
      toast.error("Suhbatlarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // 2. Qidiruv (Fayl nomi yoki ism bo'yicha)
  useEffect(() => {
    const filtered = conversations.filter(
      (c) =>
        c.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.conversation_file.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConvs(filtered);
  }, [searchTerm, conversations]);

  // 3. Suhbatni tanlash
  const handleConversationSelect = async (conv: Conversation) => {
    setSelectedConv(conv);
    setLoadingChat(true);
    setMessages([]);
    setSearchParams({ file: conv.conversation_file });

    try {
      const cleanName = conv.conversation_file.replace(/\.json$/i, "");
      const apiPath = cleanName.startsWith("conversations/") ? cleanName : `conversations/${cleanName}`;
      const data = await conversationsService.getConversationDetail(apiPath);
      
      if (data && Array.isArray(data.history)) {
        setMessages(data.history);
      } else {
        setMessages([]);
      }
    } catch (err) {
      toast.error("Suhbat tarixini yuklashda xatolik");
      setMessages([]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Scroll to bottom effect
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingChat]);

  const refreshChat = async () => {
    if (selectedConv) {
      await handleConversationSelect(selectedConv);
      toast.success("Suhbat yangilandi");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-65px)] -m-6 overflow-hidden bg-background">
        
        {/* ================= LEFT SIDEBAR (FILES LIST) ================= */}
        <div
          className={cn(
            "flex flex-col border-r border-border/40 bg-card/30 backdrop-blur-sm transition-all duration-300",
            selectedConv ? "hidden md:flex w-full md:w-80 lg:w-96" : "w-full md:w-80 lg:w-96",
          )}
        >
          <div className="p-4 border-b border-border/40 space-y-4 bg-background/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Suhbatlar</h2>
                <p className="text-xs text-muted-foreground">Fayllar ro'yxati</p>
              </div>
              <Button variant="ghost" size="icon" onClick={fetchConversations} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-secondary/50 border-transparent focus:bg-background transition-all"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="flex flex-col p-2 gap-1">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Yuklanmoqda...</div>
              ) : filteredConvs.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Fayllar topilmadi</div>
              ) : (
                filteredConvs.map((conv, idx) => (
                  <div
                    key={idx}
                    role="button"
                    onClick={() => handleConversationSelect(conv)}
                    className={cn(
                      "flex items-start gap-3 p-3 text-left rounded-lg transition-all duration-200 border border-transparent cursor-pointer group relative",
                      selectedConv?.conversation_file === conv.conversation_file
                        ? "bg-primary/10 border-primary/20 shadow-sm"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center border transition-colors",
                        selectedConv?.conversation_file === conv.conversation_file
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn(
                            "font-semibold text-sm truncate",
                            selectedConv?.conversation_file === conv.conversation_file ? "text-primary" : "text-foreground",
                          )}
                        >
                          {conv.fullname || conv.username || `Suhbat #${idx + 1}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate font-mono opacity-70">
                        {conv.conversation_file}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ================= RIGHT SIDE (CHAT AREA) ================= */}
        <div
          className={cn(
            "flex-1 flex flex-col bg-background/50 relative transition-all duration-300",
            !selectedConv ? "hidden md:flex items-center justify-center bg-muted/5" : "flex",
          )}
        >
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <header className="h-16 flex items-center justify-between px-4 border-b border-border/40 bg-card/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden -ml-2 h-9 w-9"
                    onClick={() => setSelectedConv(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <User className="h-5 w-5" />
                  </div>

                  <div className="leading-tight">
                    <h3 className="font-semibold text-sm">
                      {selectedConv.fullname || "Suhbat mazmuni"}
                    </h3>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[200px] font-mono">
                      {selectedConv.conversation_file}
                    </p>
                  </div>
                </div>

                <Button variant="ghost" size="icon" onClick={refreshChat} disabled={loadingChat}>
                  <RefreshCw className={cn("h-4 w-4", loadingChat && "animate-spin")} />
                </Button>
              </header>

              {/* Chat Messages */}
              <div className="flex-1 overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

                <ScrollArea className="h-full px-4 py-6">
                  {loadingChat ? (
                    <div className="flex h-full items-center justify-center">
                      <Loading text="Suhbat yuklanmoqda..." />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground/50">
                      <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                      <p>Suhbat tarixi mavjud emas</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 w-full pb-4">
                      {messages.map((msg, index) => {
                        const isUser = msg.role === "user";
                        const isAi = msg.role === "assistant";
                        const isSystem = msg.role === "system";

                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex w-full gap-3",
                              isUser ? "justify-end" : isSystem ? "justify-center" : "justify-start",
                            )}
                          >
                            {isAi && (
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                                <Bot className="h-4 w-4 text-primary" />
                              </div>
                            )}

                            <div
                              className={cn(
                                "relative px-5 py-3 text-sm shadow-sm max-w-[90%] md:max-w-[85%]",
                                isAi && "bg-gradient-to-br from-purple-500/30 via-blue-500/30 to-cyan-500/30 text-foreground border border-purple-400/50 rounded-2xl rounded-tl-none shadow-lg shadow-purple-500/20",
                                isUser && "bg-blue-600 text-white rounded-2xl rounded-tr-none shadow-md shadow-blue-500/10",
                                isSystem && "bg-muted/50 text-xs text-muted-foreground italic rounded-md border-none max-w-full text-center"
                              )}
                            >
                              <p className="whitespace-pre-wrap leading-relaxed break-words">
                                {msg.content}
                              </p>
                              {!isSystem && (
                                <span
                                  className={cn(
                                    "text-[10px] mt-1 block opacity-70",
                                    isUser ? "text-blue-100 text-right" : "text-muted-foreground text-left",
                                  )}
                                >
                                  {isUser ? "Mijoz" : "Bot"}
                                </span>
                              )}
                            </div>

                            {isUser && (
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mt-1 text-white text-xs font-bold shadow-lg shadow-blue-500/20">
                                U
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div ref={scrollRef} />
                    </div>
                  )}
                </ScrollArea>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <div className="p-6 rounded-full bg-muted/30">
                <FileText className="h-12 w-12 opacity-50" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">Suhbatni boshlash</h3>
                <p className="text-sm opacity-70">Ro'yxatdan faylni tanlang</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}