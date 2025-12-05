import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Send, DollarSign, Search, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_tip: boolean;
  tip_amount: number | null;
  read_at: string | null;
  profile_id: string | null;
}

interface Conversation {
  profile_id: string;
  profile_name: string;
  profile_photo: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function ClientMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [showTipDialog, setShowTipDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }
  }, [user]);

  useEffect(() => {
    if (selectedProfile) {
      fetchMessages(selectedProfile);
      markMessagesAsRead(selectedProfile);
    }
  }, [selectedProfile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Get all messages where user is sender or receiver
      const { data: messagesData, error } = await supabase
        .from("client_messages")
        .select(`
          *,
          profile:model_profiles!client_messages_profile_id_fkey(id, name, photo_url)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by profile and get latest message
      const conversationsMap = new Map<string, Conversation>();
      
      messagesData?.forEach((msg: any) => {
        if (!msg.profile) return;
        
        const profileId = msg.profile.id;
        const isFromMe = msg.sender_id === user?.id;
        
        if (!conversationsMap.has(profileId)) {
          conversationsMap.set(profileId, {
            profile_id: profileId,
            profile_name: msg.profile.name,
            profile_photo: msg.profile.photo_url,
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: !isFromMe && !msg.read_at ? 1 : 0,
          });
        } else {
          const conv = conversationsMap.get(profileId)!;
          if (!isFromMe && !msg.read_at) {
            conv.unread_count++;
          }
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Erro ao carregar conversas");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from("client_messages")
        .select("*")
        .eq("profile_id", profileId)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Erro ao carregar mensagens");
    }
  };

  const markMessagesAsRead = async (profileId: string) => {
    try {
      await supabase
        .from("client_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("profile_id", profileId)
        .eq("receiver_id", user?.id)
        .is("read_at", null);

      // Update unread count in conversations
      setConversations(prev =>
        prev.map(conv =>
          conv.profile_id === profileId ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("client-messages-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "client_messages",
          filter: `receiver_id=eq.${user?.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          // Update messages if viewing this conversation
          if (selectedProfile === newMsg.profile_id) {
            setMessages(prev => [...prev, newMsg]);
            markMessagesAsRead(newMsg.profile_id!);
          } else {
            // Update unread count
            setConversations(prev =>
              prev.map(conv =>
                conv.profile_id === newMsg.profile_id
                  ? { ...conv, unread_count: conv.unread_count + 1, last_message: newMsg.content, last_message_time: newMsg.created_at }
                  : conv
              )
            );
          }
          
          toast.info("Nova mensagem recebida");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProfile || sending) return;

    setSending(true);
    try {
      // First, get the creator's user_id from the profile
      const { data: profileData, error: profileError } = await supabase
        .from("model_profiles")
        .select("user_id")
        .eq("id", selectedProfile)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from("client_messages")
        .insert({
          sender_id: user?.id,
          receiver_id: profileData.user_id,
          content: newMessage,
          profile_id: selectedProfile,
          is_tip: false,
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      setNewMessage("");
      
      // Update conversation
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  const sendTip = async () => {
    if (!tipAmount || !selectedProfile) return;

    try {
      const amount = parseFloat(tipAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Valor inválido");
        return;
      }

      // Get the creator's user_id from the profile
      const { data: profileData, error: profileError } = await supabase
        .from("model_profiles")
        .select("user_id")
        .eq("id", selectedProfile)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from("client_messages")
        .insert({
          sender_id: user?.id,
          receiver_id: profileData.user_id,
          content: `Enviou uma gorjeta de R$ ${amount.toFixed(2)}`,
          profile_id: selectedProfile,
          is_tip: true,
          tip_amount: amount,
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      setTipAmount("");
      setShowTipDialog(false);
      toast.success("Gorjeta enviada!");
      
      fetchConversations();
    } catch (error) {
      console.error("Error sending tip:", error);
      toast.error("Erro ao enviar gorjeta");
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.profile_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.profile_id === selectedProfile);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-muted-foreground">Carregando mensagens...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Conversas</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-340px)]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.profile_id}
                    onClick={() => setSelectedProfile(conv.profile_id)}
                    className={`w-full p-4 text-left hover:bg-accent/50 transition-colors ${
                      selectedProfile === conv.profile_id ? "bg-accent" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={conv.profile_photo || ""} />
                        <AvatarFallback>{conv.profile_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold truncate">{conv.profile_name}</h4>
                          {conv.unread_count > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.last_message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(conv.last_message_time), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-2 flex flex-col">
        {!selectedProfile ? (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Selecione uma conversa</h3>
              <p className="text-muted-foreground">
                Escolha uma criadora para começar a conversar
              </p>
            </div>
          </CardContent>
        ) : (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation?.profile_photo || ""} />
                    <AvatarFallback>{selectedConversation?.profile_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedConversation?.profile_name}</h3>
                    <p className="text-xs text-muted-foreground">Online agora</p>
                  </div>
                </div>
                <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Enviar Gorjeta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enviar Gorjeta</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={tipAmount}
                          onChange={(e) => setTipAmount(e.target.value)}
                          min="1"
                          step="1"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 20, 50].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            onClick={() => setTipAmount(amount.toString())}
                          >
                            R$ {amount}
                          </Button>
                        ))}
                      </div>
                      <Button onClick={sendTip} className="w-full">
                        Enviar R$ {tipAmount || "0.00"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isFromMe = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.is_tip
                            ? "bg-yellow-500/20 border border-yellow-500/50"
                            : isFromMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.is_tip && (
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">Gorjeta</span>
                          </div>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatDistanceToNow(new Date(msg.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite uma mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  disabled={sending}
                />
                <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
