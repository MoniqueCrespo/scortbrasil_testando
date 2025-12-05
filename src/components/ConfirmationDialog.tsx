import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CheckCircle, Image, MapPin, DollarSign, Clock, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ConfirmationDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  formData: {
    name: string;
    age: string;
    category: string;
    state: string;
    city: string;
    description: string;
    hourly_price: string;
    half_period_price: string;
    overnight_price: string;
    full_day_price: string;
    selectedServices: string[];
    availability_days: string[];
    available_hours: string[];
    phone: string;
    whatsapp: string;
  };
  photosCount: number;
}

export const ConfirmationDialog = ({ open, onConfirm, onCancel, formData, photosCount }: ConfirmationDialogProps) => {
  const categoryLabels: Record<string, string> = {
    mulheres: 'Acompanhantes',
    homens: 'Homens',
    trans: 'Trans',
    casais: 'Casais',
    massagistas: 'Massagistas',
  };

  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-primary" />
            Confirmar Publicação do Anúncio
          </AlertDialogTitle>
          <AlertDialogDescription>
            Revise as informações antes de publicar seu anúncio
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Photos */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Image className="h-4 w-4 text-primary" />
              Fotos
            </div>
            <p className="text-sm text-muted-foreground">
              {photosCount} foto{photosCount !== 1 ? 's' : ''} adicionada{photosCount !== 1 ? 's' : ''}
            </p>
          </div>

          <Separator />

          {/* Basic Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              Informações Básicas
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nome:</span>
                <span className="ml-2 font-medium">{formData.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Idade:</span>
                <span className="ml-2 font-medium">{formData.age} anos</span>
              </div>
              <div>
                <span className="text-muted-foreground">Categoria:</span>
                <span className="ml-2 font-medium">{categoryLabels[formData.category]}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Localização:</span>
                <span className="ml-2 font-medium">{formData.city}, {formData.state}</span>
              </div>
            </div>
            {formData.description && (
              <div className="mt-2">
                <span className="text-muted-foreground text-sm">Descrição:</span>
                <p className="text-sm mt-1 line-clamp-3">{formData.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4 text-primary" />
              Preços
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {formData.hourly_price && (
                <div>
                  <span className="text-muted-foreground">Por hora:</span>
                  <span className="ml-2 font-medium">R$ {formData.hourly_price}</span>
                </div>
              )}
              {formData.half_period_price && (
                <div>
                  <span className="text-muted-foreground">Meio período:</span>
                  <span className="ml-2 font-medium">R$ {formData.half_period_price}</span>
                </div>
              )}
              {formData.overnight_price && (
                <div>
                  <span className="text-muted-foreground">Pernoite:</span>
                  <span className="ml-2 font-medium">R$ {formData.overnight_price}</span>
                </div>
              )}
              {formData.full_day_price && (
                <div>
                  <span className="text-muted-foreground">Dia completo:</span>
                  <span className="ml-2 font-medium">R$ {formData.full_day_price}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Availability */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-primary" />
              Disponibilidade
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground text-sm">Dias:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.availability_days.map(day => (
                    <Badge key={day} variant="secondary" className="text-xs">
                      {day.substring(0, 3)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Horários:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.available_hours.map(hour => (
                    <Badge key={hour} variant="secondary" className="text-xs">
                      {hour}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="h-4 w-4 text-primary" />
              Serviços
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.selectedServices.slice(0, 8).map(service => (
                <Badge key={service} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
              {formData.selectedServices.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{formData.selectedServices.length - 8} mais
                </Badge>
              )}
            </div>
          </div>

          {/* Contact */}
          {(formData.phone || formData.whatsapp) && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4 text-primary" />
                  Contatos
                </div>
                <div className="space-y-1 text-sm">
                  {formData.phone && (
                    <div>
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="ml-2">{formData.phone}</span>
                    </div>
                  )}
                  {formData.whatsapp && (
                    <div>
                      <span className="text-muted-foreground">WhatsApp:</span>
                      <span className="ml-2">{formData.whatsapp}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Publicar Anúncio
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
