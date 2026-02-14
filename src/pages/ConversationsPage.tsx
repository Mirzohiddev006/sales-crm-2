import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  MessageSquare,
  User as UserIcon,
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
      const clientIdFromQuery = searchParams.get("client_id");

      if (clientIdFromQuery) {
        const found = formattedData.find(c => c.client_id === Number(clientIdFromQuery));
        if (found) handleConversationSelect(found);
      } else if (fileFromQuery) {
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

  // 2. Qidiruv
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
      }
    } catch (err) {
      toast.error("Suhbat tarixini yuklashda xatolik");
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
      <div className="flex h-[calc(100vh-65px)] -m-6 overflow-hidden bg-[#021026]">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <div className={cn(
            "flex flex-col border-r border-white/5 bg-[#0f172a]/40 backdrop-blur-xl transition-all duration-300",
            selectedConv ? "hidden md:flex w-full md:w-80 lg:w-96" : "w-full md:w-80 lg:w-96",
          )}>
          <div className="p-6 border-b border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">Suhbatlar</h2>
                <p className="text-[10px] uppercase font-bold text-indigo-400/60 tracking-widest mt-1">Fayllar tizimi</p>
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-indigo-500/10 text-indigo-400" onClick={fetchConversations} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-950/50 border-white/5 focus:border-indigo-500/50 transition-all rounded-xl text-sm"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3">
            <div className="flex flex-col py-4 gap-2">
              {isLoading ? (
                <div className="p-4 text-center text-xs font-bold text-slate-500 uppercase animate-pulse">Yuklanmoqda...</div>
              ) : filteredConvs.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Fayllar topilmadi</div>
              ) : (
                filteredConvs.map((conv, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleConversationSelect(conv)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-2xl transition-all duration-300 cursor-pointer group border",
                      selectedConv?.conversation_file === conv.conversation_file
                        ? "bg-indigo-600/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                        : "bg-transparent border-transparent hover:bg-white/5"
                    )}
                  >
                    <div className={cn(
                        "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center border transition-all",
                        selectedConv?.conversation_file === conv.conversation_file
                          ? "bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/40"
                          : "bg-slate-900 text-slate-500 border-white/5"
                      )}>
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate text-slate-200 group-hover:text-white transition-colors">
                        {conv.fullname || conv.username || `Suhbat #${idx + 1}`}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate font-mono mt-1 opacity-60 italic">
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
        <div className={cn(
            "flex-1 flex flex-col relative transition-all duration-300 bg-[radial-gradient(circle_at_top_right,#1e293b33,transparent)]",
            !selectedConv ? "hidden md:flex items-center justify-center" : "flex",
          )}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <header className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-[#021026]/80 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="md:hidden text-slate-400" onClick={() => setSelectedConv(null)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-100 tracking-tight">{selectedConv.fullname || "Suhbat Tahlili"}</h3>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1 opacity-70">Mijoz suhbati</p>
                  </div>
                </div>
                <Button variant="outline" size="icon" className="border-white/10 bg-white/5 text-slate-400 hover:text-white" onClick={refreshChat} disabled={loadingChat}>
                  <RefreshCw className={cn("h-4 w-4", loadingChat && "animate-spin")} />
                </Button>
              </header>

              {/* Chat Messages */}
              <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full px-6 py-8">
                  {loadingChat ? (
                    <div className="flex h-full items-center justify-center"><Loading /></div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground/50">
                      <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                      <p>Suhbat tarixi mavjud emas</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-10">
                      {messages.map((msg, index) => {
                        const isUser = msg.role === "user";
                        const isAi = msg.role === "assistant";
                        const isSystem = msg.role === "system";

                        return (
                          <div key={index} className={cn(
                              "flex w-full gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
                              isUser ? "justify-start" : isSystem ? "justify-center" : "justify-end"
                            )}>
                            {/* User Icon (Chapda) */}
                            {isUser && (
                              <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center mt-1">
                                <UserIcon className="h-5 w-5 text-slate-400" />
                              </div>
                            )}

                            <div className={cn(
                                "relative px-6 py-4 text-sm shadow-2xl max-w-[85%] md:max-w-[75%]",
                                isUser && "bg-[#1e293b] text-slate-200 rounded-3xl rounded-tl-none border border-white/5",
                                isAi && "bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-3xl rounded-tr-none border border-indigo-400/30 shadow-indigo-500/20",
                                isSystem && "bg-white/5 text-[11px] text-slate-500 italic rounded-xl border-none text-center px-10"
                              )}>
                              <p className="whitespace-pre-wrap leading-relaxed tracking-wide">{msg.content}</p>
                              {!isSystem && (
                                <span className={cn(
                                    "text-[9px] mt-3 block font-black uppercase tracking-[0.2em] opacity-40",
                                    isUser ? "text-slate-400 text-left" : "text-indigo-100 text-right"
                                  )}>
                                  {isUser ? "Mijoz" : "AI Assistant"}
                                </span>
                              )}
                            </div>

                            {/* AI Icon (O'ngda) */}
                            {isAi && (
                              <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-indigo-500 flex items-center justify-center mt-1 shadow-lg shadow-indigo-500/40">
                                <Bot className="h-5 w-5 text-white" />
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
            <div className="flex flex-col items-center justify-center h-full gap-6 animate-in fade-in zoom-in duration-700">
              <div className="p-10 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 shadow-inner group">
                <MessageSquare className="h-16 w-16 text-indigo-500/20 group-hover:text-indigo-500/40 transition-all duration-500 scale-110 group-hover:scale-125" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-200 tracking-tight">Suhbatni boshlash</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chap tarafdan JSON faylni tanlang</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}