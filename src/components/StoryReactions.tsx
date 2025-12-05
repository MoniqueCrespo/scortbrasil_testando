import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Flame, Hand, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StoryReactionsProps {
  storyId: string;
  onReactionSent?: () => void;
}

const reactions = [
  { type: "like", icon: Heart, label: "Curtir", color: "text-red-500" },
  { type: "love", icon: Heart, label: "Amar", color: "text-pink-500" },
  { type: "fire", icon: Flame, label: "Top", color: "text-orange-500" },
  { type: "clap", icon: Hand, label: "Aplaudir", color: "text-yellow-500" },
];

export const StoryReactions = ({ storyId, onReactionSent }: StoryReactionsProps) => {
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendReaction = async (reactionType: string, messageText?: string) => {
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("story_reactions").insert({
        story_id: storyId,
        viewer_id: user?.id || null,
        reaction_type: reactionType,
        message: messageText || null,
      });

      if (error) throw error;

      toast({
        title: "Reação enviada!",
        description: reactionType === "message" 
          ? "Sua mensagem foi enviada ao anunciante"
          : "Sua reação foi registrada",
      });

      setMessage("");
      setShowMessageInput(false);
      onReactionSent?.();
    } catch (error) {
      console.error("Error sending reaction:", error);
      toast({
        title: "Erro ao enviar reação",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendReaction("message", message.trim());
    }
  };

  return (
    <div className="space-y-3">
      {!showMessageInput ? (
        <>
          <div className="flex gap-2 justify-center">
            {reactions.map((reaction) => (
              <Button
                key={reaction.type}
                variant="outline"
                size="sm"
                onClick={() => sendReaction(reaction.type)}
                disabled={sending}
                className="flex items-center gap-1 hover:scale-110 transition-transform"
              >
                <reaction.icon className={`h-4 w-4 ${reaction.color}`} />
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMessageInput(true)}
            className="w-full flex items-center gap-2 text-white hover:bg-white/20"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar mensagem
          </Button>
        </>
      ) : (
        <form onSubmit={handleMessageSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            autoFocus
          />
          <Button type="submit" size="sm" disabled={!message.trim() || sending}>
            Enviar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowMessageInput(false);
              setMessage("");
            }}
            className="text-white hover:bg-white/20"
          >
            Cancelar
          </Button>
        </form>
      )}
    </div>
  );
};
