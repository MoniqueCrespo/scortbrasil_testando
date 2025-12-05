import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface ReviewSummaryProps {
  profileId: string;
  refreshTrigger?: number;
}

interface RatingStats {
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number };
}

export const ReviewSummary = ({ profileId, refreshTrigger = 0 }: ReviewSummaryProps) => {
  const [stats, setStats] = useState<RatingStats>({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profileId, refreshTrigger]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile_reviews')
        .select('rating')
        .eq('profile_id', profileId)
        .eq('is_verified', true);

      if (error) throw error;

      if (!data || data.length === 0) {
        setStats({
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        });
        return;
      }

      const distribution: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalRating = 0;

      data.forEach((review) => {
        distribution[review.rating]++;
        totalRating += review.rating;
      });

      setStats({
        averageRating: totalRating / data.length,
        totalReviews: data.length,
        distribution,
      });
    } catch (error) {
      console.error('Error fetching review stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stats.totalReviews === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nenhuma avaliação ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  const recommendationPercentage = ((stats.distribution[5] + stats.distribution[4]) / stats.totalReviews) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(stats.averageRating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.totalReviews} {stats.totalReviews === 1 ? 'avaliação' : 'avaliações'}
            </p>
            <p className="text-sm font-medium text-primary">
              {recommendationPercentage.toFixed(0)}% recomendam
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="w-3 h-3 fill-primary text-primary" />
                </div>
                <Progress
                  value={(stats.distribution[rating] / stats.totalReviews) * 100}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-8 text-right">
                  {stats.distribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
