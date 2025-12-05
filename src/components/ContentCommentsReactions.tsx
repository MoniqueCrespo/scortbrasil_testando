import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Heart, Flame, Star, ThumbsUp, Send, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContentCommentsReactionsProps {
  contentId: string;
}

interface Comment {
  id: string;
  comment_text: string;
  created_at: string;
  user_id: string;
  profiles?: { email: string };
}

interface ReactionCount {
  reaction_type: string;
  count: number;
}

const reactionIcons = {
  like: ThumbsUp,
  love: Heart,
  fire: Flame,
  star: Star,
};

export const ContentCommentsReactions = ({ contentId }: ContentCommentsReactionsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<ReactionCount[]>([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (contentId) {
      fetchComments();
      fetchReactions();
      const cleanup = subscribeToRealtime();
      return cleanup;
    }
  }, [contentId]);

  const subscribeToRealtime = () => {
    const commentsChannel = supabase
      .channel(`comments:${contentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_comments',
          filter: `content_id=eq.${contentId}`,
        },
        () => fetchComments()
      )
      .subscribe();

    const reactionsChannel = supabase
      .channel(`reactions:${contentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_reactions',
          filter: `content_id=eq.${contentId}`,
        },
        () => fetchReactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(reactionsChannel);
    };
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('content_comments')
      .select('*')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false });

    setComments((data || []) as Comment[]);
  };

  const fetchReactions = async () => {
    const { data } = await supabase
      .from('content_reactions')
      .select('reaction_type, user_id')
      .eq('content_id', contentId);

    if (data) {
      const counts = data.reduce((acc, r) => {
        const existing = acc.find(c => c.reaction_type === r.reaction_type);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ reaction_type: r.reaction_type, count: 1 });
        }
        return acc;
      }, [] as ReactionCount[]);

      setReactions(counts);
      setUserReactions(data.filter(r => r.user_id === user?.id).map(r => r.reaction_type));
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_comments')
        .insert({
          content_id: contentId,
          user_id: user.id,
          comment_text: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      toast({ title: "Comentário adicionado!" });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('content_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      toast({ title: "Comentário excluído!" });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o comentário",
        variant: "destructive",
      });
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!user) return;

    try {
      const hasReaction = userReactions.includes(reactionType);

      if (hasReaction) {
        await supabase
          .from('content_reactions')
          .delete()
          .eq('content_id', contentId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);
      } else {
        await supabase
          .from('content_reactions')
          .insert({
            content_id: contentId,
            user_id: user.id,
            reaction_type: reactionType,
          });
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Reações */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(reactionIcons).map(([type, Icon]) => {
          const count = reactions.find(r => r.reaction_type === type)?.count || 0;
          const isActive = userReactions.includes(type);

          return (
            <Button
              key={type}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleReaction(type)}
              disabled={!user}
            >
              <Icon className={`w-4 h-4 mr-1 ${isActive ? 'fill-current' : ''}`} />
              {count > 0 && <span className="ml-1">{count}</span>}
            </Button>
          );
        })}
      </div>

      {/* Novo Comentário */}
      {user && (
        <div className="space-y-2">
          <Textarea
            placeholder="Adicione um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Enviando...' : 'Comentar'}
          </Button>
        </div>
      )}

      {/* Lista de Comentários */}
      <div className="space-y-4">
        <h4 className="font-semibold">{comments.length} Comentários</h4>
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 p-3 rounded-lg border">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{comment.user_id.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{comment.profiles?.email || comment.user_id.substring(0, 8) || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {user?.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <p className="mt-2 text-sm">{comment.comment_text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
