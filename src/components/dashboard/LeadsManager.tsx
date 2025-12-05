import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar,
  Tag,
  Download,
  Search,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  source: 'whatsapp' | 'telegram' | 'phone' | 'email';
  status: 'new' | 'contacted' | 'negotiating' | 'converted' | 'lost';
  notes: string;
  tags: string[];
  contactedAt?: Date;
  createdAt: Date;
}

interface LeadsManagerProps {
  profileId: string;
}

const LeadsManager = ({ profileId }: LeadsManagerProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock data - em produção, virá do Supabase
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'João Silva',
      phone: '(11) 98765-4321',
      source: 'whatsapp',
      status: 'new',
      notes: 'Interessado em serviço completo',
      tags: ['vip', 'primeira-vez'],
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Maria Santos',
      phone: '(11) 91234-5678',
      email: 'maria@email.com',
      source: 'telegram',
      status: 'contacted',
      notes: 'Agendou para sábado às 20h',
      tags: ['agendado', 'recorrente'],
      contactedAt: new Date('2024-01-16'),
      createdAt: new Date('2024-01-14')
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      phone: '(11) 99876-5432',
      source: 'phone',
      status: 'converted',
      notes: 'Cliente excelente, deixou ótima avaliação',
      tags: ['5-estrelas', 'recorrente'],
      contactedAt: new Date('2024-01-17'),
      createdAt: new Date('2024-01-13')
    }
  ]);

  const handleAddLead = () => {
    toast({
      title: "Lead adicionado",
      description: "O novo lead foi adicionado com sucesso à sua lista.",
    });
    setIsAddLeadOpen(false);
  };

  const handleExportLeads = () => {
    toast({
      title: "Exportando leads",
      description: "Seus leads estão sendo exportados para CSV...",
    });
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.phone?.includes(searchQuery) ||
                         lead.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    new: { label: 'Novo', color: 'bg-blue-500/10 text-blue-500' },
    contacted: { label: 'Contatado', color: 'bg-purple-500/10 text-purple-500' },
    negotiating: { label: 'Negociando', color: 'bg-orange-500/10 text-orange-500' },
    converted: { label: 'Convertido', color: 'bg-green-500/10 text-green-500' },
    lost: { label: 'Perdido', color: 'bg-red-500/10 text-red-500' }
  };

  const sourceIcons = {
    whatsapp: MessageSquare,
    telegram: MessageSquare,
    phone: Phone,
    email: Mail
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Leads</h2>
          <p className="text-muted-foreground">
            Gerencie seus contatos e oportunidades
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportLeads}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Lead</DialogTitle>
                <DialogDescription>
                  Registre um novo contato ou oportunidade
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" placeholder="Nome do cliente" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(11) 98765-4321" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="source">Fonte</Label>
                    <Select defaultValue="whatsapp">
                      <SelectTrigger id="source">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="phone">Telefone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue="new">
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Novo</SelectItem>
                        <SelectItem value="contacted">Contatado</SelectItem>
                        <SelectItem value="negotiating">Negociando</SelectItem>
                        <SelectItem value="converted">Convertido</SelectItem>
                        <SelectItem value="lost">Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Anotações</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Observações sobre este lead..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input id="tags" placeholder="vip, primeira-vez, recorrente" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddLead}>
                  Adicionar Lead
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">
              Todos os contatos registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {leads.filter(l => l.status === 'new').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando contato
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Negociação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {leads.filter(l => l.status === 'negotiating' || l.status === 'contacted').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {leads.filter(l => l.status === 'converted').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes efetivados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Meus Leads</CardTitle>
              <CardDescription>
                {filteredLeads.length} lead(s) encontrado(s)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="new">Novos</SelectItem>
                  <SelectItem value="contacted">Contatados</SelectItem>
                  <SelectItem value="negotiating">Negociando</SelectItem>
                  <SelectItem value="converted">Convertidos</SelectItem>
                  <SelectItem value="lost">Perdidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeads.map((lead) => {
              const SourceIcon = sourceIcons[lead.source];
              return (
                <div
                  key={lead.id}
                  className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-muted rounded-lg">
                          <SourceIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{lead.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {lead.phone && <span>{lead.phone}</span>}
                            {lead.email && <span>{lead.email}</span>}
                          </div>
                        </div>
                      </div>
                      
                      {lead.notes && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {lead.notes}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={statusConfig[lead.status].color}>
                          {statusConfig[lead.status].label}
                        </Badge>
                        {lead.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {lead.createdAt.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsManager;