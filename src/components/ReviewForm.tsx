import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReviewFormProps {
  profileId: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ profileId, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Você precisa estar logado para deixar uma avaliação.',
        variant: 'destructive',
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: 'Avaliação obrigatória',
        description: 'Por favor, selecione uma classificação de 1 a 5 estrelas.',
        variant: 'destructive',
      });
      return;
    }

    if (comment.length < 50) {
      toast({
        title: 'Comentário muito curto',
        description: 'O comentário deve ter pelo menos 50 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profile_reviews')
        .insert({
          profile_id: profileId,
          user_id: user.id,
          rating,
          comment,
          is_verified: false, // Will be moderated
        });

      if (error) throw error;

      toast({
        title: 'Avaliação enviada!',
        description: 'Sua avaliação será publicada após moderação.',
      });

      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar avaliação',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">
            Faça login para deixar uma avaliação
          </p>
          <Button onClick={() => window.location.href = '/auth'}>
            Fazer Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deixe sua avaliação</CardTitle>
        <CardDescription>
          Compartilhe sua experiência com outros usuários
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Classificação *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Comentário * (mínimo 50 caracteres)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Compartilhe detalhes sobre sua experiência..."
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || comment.length < 50}
            className="w-full"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
