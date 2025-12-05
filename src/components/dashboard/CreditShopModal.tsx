import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonus_credits: number;
  price: number;
  sort_order: number;
}

interface CreditShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreditShopModal = ({ isOpen, onClose }: CreditShopModalProps) => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (!error && data) {
      setPackages(data);
    }
  };

  const handlePurchase = async (packageId: string) => {
    setLoading(true);
    setSelectedPackage(packageId);

    try {
      const { data, error } = await supabase.functions.invoke('purchase-credits', {
        body: { package_id: packageId },
      });

      if (error) throw error;

      if (data?.init_point) {
        window.location.href = data.init_point;
      }
    } catch (error: any) {
      toast.error("Erro ao processar compra. Tente novamente.");
      console.error('Erro:', error);
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            Comprar Créditos
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
          {packages.map((pkg) => {
            const totalCredits = pkg.credits + pkg.bonus_credits;
            const isPopular = pkg.name === 'Popular';
            
            return (
              <Card 
                key={pkg.id}
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  isPopular ? 'border-primary/50 bg-primary/5' : ''
                }`}
                onClick={() => handlePurchase(pkg.id)}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Mais Popular</Badge>
                  </div>
                )}
                
                <CardContent className="pt-6 text-center">
                  <Coins className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-bold text-lg mb-1">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {pkg.credits}
                  </div>
                  {pkg.bonus_credits > 0 && (
                    <Badge variant="secondary" className="mb-3 text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      +{pkg.bonus_credits} bônus
                    </Badge>
                  )}
                  <div className="text-xs text-muted-foreground mb-3">
                    = {totalCredits} créditos totais
                  </div>
                  <div className="text-2xl font-bold mb-4">
                    R$ {pkg.price.toFixed(2)}
                  </div>
                  <Button 
                    className="w-full"
                    disabled={loading && selectedPackage === pkg.id}
                  >
                    {loading && selectedPackage === pkg.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Comprar Agora'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              O que você pode fazer com seus créditos:
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="font-bold text-primary">50 créditos</span>
                <span className="text-muted-foreground">=</span>
                <span>Boost Básico (24h)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-primary">150 créditos</span>
                <span className="text-muted-foreground">=</span>
                <span>Boost Plus (7 dias)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-primary">100 créditos</span>
                <span className="text-muted-foreground">=</span>
                <span>Selo Premium (7 dias)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-primary">200 créditos</span>
                <span className="text-muted-foreground">=</span>
                <span>Destaque Homepage (7 dias)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CreditShopModal;