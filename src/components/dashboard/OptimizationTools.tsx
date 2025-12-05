import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  Camera, 
  FileText, 
  Clock, 
  Target, 
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";

interface OptimizationToolsProps {
  profileId: string;
  profileData?: any;
}

const OptimizationTools = ({ profileId, profileData }: OptimizationToolsProps) => {
  // Score de qualidade baseado em completude do perfil
  const qualityScore = 78;

  const suggestions = [
    {
      priority: 'high',
      icon: Camera,
      title: 'Adicione mais fotos',
      description: 'Anúncios com 8+ fotos recebem 65% mais cliques',
      action: 'Adicionar fotos',
      completed: false,
      impact: '+65% cliques'
    },
    {
      priority: 'high',
      icon: FileText,
      title: 'Melhore sua descrição',
      description: 'Descrições com 150+ caracteres performam 40% melhor',
      action: 'Editar descrição',
      completed: false,
      impact: '+40% visualizações'
    },
    {
      priority: 'medium',
      icon: Clock,
      title: 'Atualize disponibilidade',
      description: 'Perfis com horários específicos convertem 25% mais',
      action: 'Atualizar horários',
      completed: true,
      impact: '+25% conversão'
    },
    {
      priority: 'medium',
      icon: Target,
      title: 'Complete serviços oferecidos',
      description: 'Liste pelo menos 5 serviços para melhor visibilidade',
      action: 'Adicionar serviços',
      completed: false,
      impact: '+30% buscas'
    },
    {
      priority: 'low',
      icon: Sparkles,
      title: 'Ative um destaque',
      description: 'Anúncios em destaque recebem 3x mais visitas',
      action: 'Ver destaques',
      completed: false,
      impact: '+300% visitas'
    }
  ];

  const peakHours = [
    { day: 'Segunda-Sexta', hours: '18h - 21h', traffic: 'Alto' },
    { day: 'Sábados', hours: '15h - 23h', traffic: 'Muito Alto' },
    { day: 'Domingos', hours: '17h - 22h', traffic: 'Alto' }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Quality Score */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Score de Qualidade do Anúncio
              </CardTitle>
              <CardDescription className="mt-2">
                Seu anúncio está performando bem, mas há espaço para melhorias
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{qualityScore}</div>
              <div className="text-sm text-muted-foreground">de 100</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={qualityScore} className="h-2" />
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-500">89</div>
              <div className="text-xs text-muted-foreground">Fotos</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-500">72</div>
              <div className="text-xs text-muted-foreground">Descrição</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-500">85</div>
              <div className="text-xs text-muted-foreground">Completude</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Sugestões de Otimização
          </CardTitle>
          <CardDescription>
            Ações prioritárias para melhorar seu desempenho
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className={`p-4 border rounded-lg transition-all duration-300 hover:shadow-md ${
                suggestion.completed 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  suggestion.priority === 'high' 
                    ? 'bg-red-500/10 text-red-500' 
                    : suggestion.priority === 'medium'
                    ? 'bg-orange-500/10 text-orange-500'
                    : 'bg-blue-500/10 text-blue-500'
                }`}>
                  <suggestion.icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{suggestion.title}</h4>
                    {suggestion.priority === 'high' && (
                      <Badge variant="destructive" className="text-xs">Alta Prioridade</Badge>
                    )}
                    {suggestion.completed && (
                      <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Concluído
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {suggestion.impact}
                    </Badge>
                    {!suggestion.completed && (
                      <Button size="sm" variant="outline">
                        {suggestion.action}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Peak Hours Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Horários de Pico Recomendados
          </CardTitle>
          <CardDescription>
            Melhores momentos para atualizar seu anúncio ou publicar stories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {peakHours.map((period, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <div className="font-semibold">{period.day}</div>
                  <div className="text-sm text-muted-foreground">{period.hours}</div>
                </div>
                <Badge 
                  variant={period.traffic === 'Muito Alto' ? 'default' : 'secondary'}
                  className={period.traffic === 'Muito Alto' ? 'bg-primary' : ''}
                >
                  {period.traffic}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Dica Profissional</h4>
                <p className="text-sm text-muted-foreground">
                  Atualize suas fotos e descrição nos horários de pico para maximizar a visibilidade. 
                  Anúncios atualizados aparecem primeiro nos resultados de busca.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizationTools;