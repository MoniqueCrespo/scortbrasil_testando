import { useEffect, useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Review {
  id: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  created_at: string;
  user_id: string | null;
}

interface ReviewListProps {
  profileId: string;
  refreshTrigger?: number;
}

export const ReviewList = ({ profileId, refreshTrigger = 0 }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const REVIEWS_PER_PAGE = 6;

  useEffect(() => {
    fetchReviews();
  }, [profileId, refreshTrigger]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile_reviews')
        .select('*')
        .eq('profile_id', profileId)
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .range((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE - 1);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (userId: string | null) => {
    if (!userId) return 'A';
    // Generate initials from user ID for anonymity
    return userId.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                  {getInitials(review.user_id)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Usuário Anônimo</span>
                    {review.is_verified && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.comment}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
