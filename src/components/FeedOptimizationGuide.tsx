import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  FileText,
  Briefcase,
  Calendar,
  Phone,
  Shield,
  MapPin,
  TrendingUp,
  Zap,
  Star,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  Info,
  Edit,
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type ModelProfile = Tables<"model_profiles">;

interface FeedOptimizationGuideProps {
  profile: ModelProfile;
}

interface Criterion {
  id: string;
  label: string;
  icon: any;
  isMet: boolean;
  priority: "critical" | "high" | "medium";
  impact: string;
}

const calculateFeedScore = (profile: ModelProfile): number => {
  let score = 0;

  // Critérios obrigatórios (40 pontos)
  if (profile.is_active) score += 5;
  if (profile.photos && profile.photos.length > 0) score += 5;
  if (profile.name) score += 5;
  if (profile.age) score += 5;
  if (profile.state) score += 5;
  if (profile.city) score += 5;
  if (profile.category) score += 5;
  if (profile.pricing && (profile.pricing as any).hourly) score += 5;

  // Critérios de otimização (60 pontos)
  if (profile.photos && profile.photos.length >= 4) score += 10;
  if (profile.description && profile.description.length >= 100) score += 10;
  if (profile.services && profile.services.length >= 3) score += 10;
  if (profile.availability && profile.availability.length > 0) score += 10;
  if (profile.whatsapp || profile.telegram) score += 10;
  if (profile.verified) score += 10;

  return score;
};

const getMandatoryCriteria = (profile: ModelProfile): Criterion[] => [
  {
    id: "active",
    label: "Perfil ativo",
    icon: CheckCircle,
    isMet: !!profile.is_active,
    priority: "critical",
    impact: "Perfis inativos não aparecem no feed",
  },
  {
    id: "photo",
    label: "Pelo menos 1 foto",
    icon: Camera,
    isMet: !!profile.photos && profile.photos.length > 0,
    priority: "critical",
    impact: "Feed requer fotos para exibição",
  },
  {
    id: "name",
    label: "Nome preenchido",
    icon: FileText,
    isMet: !!profile.name,
    priority: "critical",
    impact: "Identificação obrigatória",
  },
  {
    id: "age",
    label: "Idade preenchida",
    icon: Calendar,
    isMet: !!profile.age,
    priority: "critical",
    impact: "Informação essencial para usuários",
  },
  {
    id: "location",
    label: "Estado e cidade selecionados",
    icon: MapPin,
    isMet: !!profile.state && !!profile.city,
    priority: "critical",
    impact: "Localização é filtro principal do feed",
  },
  {
    id: "category",
    label: "Categoria selecionada",
    icon: Briefcase,
    isMet: !!profile.category,
    priority: "critical",
    impact: "Determina em quais feeds aparece",
  },
  {
    id: "price",
    label: "Preço por hora definido",
    icon: TrendingUp,
    isMet: !!profile.pricing && !!(profile.pricing as any).hourly,
    priority: "critical",
    impact: "Informação de valor esperada",
  },
];

const getOptimizationCriteria = (profile: ModelProfile): Criterion[] => [
  {
    id: "multiple_photos",
    label: "4+ fotos enviadas",
    icon: Camera,
    isMet: !!profile.photos && profile.photos.length >= 4,
    priority: "high",
    impact: "+60% visualizações",
  },
  {
    id: "description",
    label: "Descrição com 100+ caracteres",
    icon: FileText,
    isMet: !!profile.description && profile.description.length >= 100,
    priority: "high",
    impact: "+40% engajamento",
  },
  {
    id: "services",
    label: "3+ serviços especificados",
    icon: Briefcase,
    isMet: !!profile.services && profile.services.length >= 3,
    priority: "high",
    impact: "+25% interesse",
  },
  {
    id: "availability",
    label: "Disponibilidade definida",
    icon: Clock,
    isMet: !!profile.availability && profile.availability.length > 0,
    priority: "medium",
    impact: "+30% conversão",
  },
  {
    id: "contact",
    label: "WhatsApp ou Telegram",
    icon: Phone,
    isMet: !!profile.whatsapp || !!profile.telegram,
    priority: "high",
    impact: "+50% contatos",
  },
  {
    id: "verified",
    label: "Verificação obtida",
    icon: Shield,
    isMet: !!profile.verified,
    priority: "high",
    impact: "+200% cliques",
  },
];

export function FeedOptimizationGuide({ profile }: FeedOptimizationGuideProps) {
  const navigate = useNavigate();
  const score = calculateFeedScore(profile);
  const mandatoryCriteria = getMandatoryCriteria(profile);
  const optimizationCriteria = getOptimizationCriteria(profile);
  
  const allMandatoryMet = mandatoryCriteria.every(c => c.isMet);
  const completedOptimizations = optimizationCriteria.filter(c => c.isMet).length;

  const getScoreMessage = () => {
    if (score < 40) return "Seu perfil precisa de atenção urgente";
    if (score < 60) return "Bom começo! Continue melhorando";
    if (score < 80) return "Muito bem! Quase lá";
    if (score < 100) return "Excelente! Falta pouco para perfeição";
    return "🎉 Perfil perfeitamente otimizado!";
  };

  const getScoreColor = () => {
    if (score < 40) return "text-destructive";
    if (score < 60) return "text-orange-500";
    if (score < 80) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Header com Score */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Guia de Otimização para o Feed
              </CardTitle>
              <CardDescription>
                Maximize sua visibilidade seguindo nossos critérios
              </CardDescription>
            </div>
            <Badge variant={score === 100 ? "default" : "secondary"} className="text-lg px-4 py-2">
              {score}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Pontuação de Visibilidade</span>
              <span className={`font-bold ${getScoreColor()}`}>{getScoreMessage()}</span>
            </div>
            <Progress value={score} className="h-3" />
          </div>

          {!allMandatoryMet && (
            <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-destructive">Atenção: Critérios obrigatórios pendentes</p>
                <p className="text-sm text-muted-foreground">
                  Seu perfil não aparecerá no feed até completar todos os requisitos obrigatórios.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist de Critérios */}
      <Accordion type="multiple" defaultValue={["mandatory", "optimization"]} className="space-y-4">
        {/* Critérios Obrigatórios */}
        <AccordionItem value="mandatory" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                allMandatoryMet ? "bg-green-500/10" : "bg-destructive/10"
              }`}>
                {allMandatoryMet ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Critérios Obrigatórios</h3>
                <p className="text-sm text-muted-foreground">
                  {mandatoryCriteria.filter(c => c.isMet).length}/{mandatoryCriteria.length} completos
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-3 pt-4">
              {mandatoryCriteria.map((criterion) => {
                const Icon = criterion.icon;
                return (
                  <div
                    key={criterion.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                      criterion.isMet ? "bg-green-500/5 border-green-500/20" : "bg-muted border-border"
                    }`}
                  >
                    <div className={`mt-0.5 ${criterion.isMet ? "text-green-500" : "text-muted-foreground"}`}>
                      {criterion.isMet ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{criterion.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{criterion.impact}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Critérios de Otimização */}
        <AccordionItem value="optimization" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Critérios de Otimização</h3>
                <p className="text-sm text-muted-foreground">
                  {completedOptimizations}/{optimizationCriteria.length} completos • Melhore sua visibilidade
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-3 pt-4">
              {optimizationCriteria.map((criterion) => {
                const Icon = criterion.icon;
                return (
                  <div
                    key={criterion.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                      criterion.isMet ? "bg-primary/5 border-primary/20" : "bg-muted border-border"
                    }`}
                  >
                    <div className={`mt-0.5 ${criterion.isMet ? "text-primary" : "text-muted-foreground"}`}>
                      {criterion.isMet ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{criterion.label}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {criterion.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {criterion.isMet ? "✓ Completo" : "Recomendado para aumentar engajamento"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Como Funciona o Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Como Funciona o Feed?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Ordem Cronológica</p>
                <p className="text-xs text-muted-foreground">
                  Perfis mais recentes aparecem primeiro
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Filtros Aplicados</p>
                <p className="text-xs text-muted-foreground">
                  Usuários filtram por categoria, estado, cidade
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Destaque Premium</p>
                <p className="text-xs text-muted-foreground">
                  Perfis premium ganham destaque visual
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Eye className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Rastreamento</p>
                <p className="text-xs text-muted-foreground">
                  Views, favoritos e cliques são contabilizados
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dicas Profissionais */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Dicas Profissionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-start gap-2">
                <Camera className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm mb-1">Fotos de Alta Qualidade</p>
                  <p className="text-xs text-muted-foreground">
                    Use imagens com mínimo 1080px. 80% dos cliques vêm da primeira foto.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm mb-1">Atualize Regularmente</p>
                  <p className="text-xs text-muted-foreground">
                    Perfis atualizados aparecem como recentes e ganham mais visibilidade.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm mb-1">Descrição Autêntica</p>
                  <p className="text-xs text-muted-foreground">
                    Textos genuínos geram 3x mais mensagens que descrições genéricas.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm mb-1">Especifique Bairros</p>
                  <p className="text-xs text-muted-foreground">
                    Apareça em buscas localizadas e aumente conversão em +35%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparativo Grátis vs Premium */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Grátis vs Premium
          </CardTitle>
          <CardDescription>Veja as vantagens do plano premium</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Recurso</th>
                  <th className="text-center py-3 px-4 font-medium">Grátis</th>
                  <th className="text-center py-3 px-4 font-medium bg-primary/5">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 px-4 text-sm">Aparece no Feed</td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4 bg-primary/5">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm">Ordem de Exibição</td>
                  <td className="text-center py-3 px-4 text-sm text-muted-foreground">Cronológica</td>
                  <td className="text-center py-3 px-4 bg-primary/5">
                    <Badge variant="default">Topo Priorizado</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm">Badge Destaque</td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4 bg-primary/5">
                    <Star className="h-5 w-5 text-primary mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm">Estatísticas</td>
                  <td className="text-center py-3 px-4 text-sm text-muted-foreground">Básicas</td>
                  <td className="text-center py-3 px-4 bg-primary/5">
                    <Badge variant="secondary">Avançadas</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm font-medium">Visibilidade Esperada</td>
                  <td className="text-center py-3 px-4 text-sm text-muted-foreground">Normal</td>
                  <td className="text-center py-3 px-4 bg-primary/5">
                    <Badge className="bg-gradient-to-r from-primary to-[hsl(320,75%,58%)]">
                      3x Maior
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CTAs Contextuais */}
      <div className="flex flex-col sm:flex-row gap-3">
        {score < 100 && (
          <Button
            onClick={() => navigate(`/anuncios/editar/${profile.id}`)}
            className="flex-1 bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90"
          >
            <Edit className="h-4 w-4 mr-2" />
            Completar Perfil Agora
          </Button>
        )}
        
        {!profile.verified && (
          <Button
            onClick={() => navigate("/verificacao")}
            variant="outline"
            className="flex-1"
          >
            <Shield className="h-4 w-4 mr-2" />
            Solicitar Verificação
          </Button>
        )}
        
        {score >= 80 && !profile.featured && (
          <Button
            onClick={() => navigate(`/planos?profile=${profile.id}`)}
            variant="default"
            className="flex-1"
          >
            <Star className="h-4 w-4 mr-2" />
            Considere Premium
          </Button>
        )}
      </div>
    </div>
  );
}
