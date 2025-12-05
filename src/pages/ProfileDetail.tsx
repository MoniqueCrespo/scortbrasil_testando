import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Heart, Share2, Shield, Clock, DollarSign, User, Ruler, Phone, MessageCircle, ChevronLeft, ChevronRight, Camera, Eye } from 'lucide-react';
import { useState } from 'react';
import { MessageDialog } from '@/components/MessageDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useAcompanhante } from '@/hooks/useWordPressAPI';
import { Loader2 } from 'lucide-react';

// Mapeamento de categorias
const categoryNames: Record<string, string> = {
  mulheres: 'Acompanhantes',
  homens: 'Homens',
  trans: 'Trans',
  casais: 'Casais',
  massagistas: 'Massagistas'
};

const ProfileDetail = () => {
  const { profileSlug, profileId, category: categoryParam } = useParams<{
    state?: string;
    city?: string;
    category?: string;
    profileSlug?: string;
    profileId?: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  // Detectar slug
  const detectedSlug = profileSlug || categoryParam || profileId;
  
  // Hook WordPress API
  const { profile, loading: isLoading, error } = useAcompanhante(detectedSlug);

  // Fotos do perfil
  const photos = profile?.photos || (profile?.image ? [profile.image] : []);
  const mainPhoto = photos[currentPhotoIndex] || profile?.image || '/placeholder.svg';

  // Navegação de fotos
  const nextPhoto = () => {
    if (photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  // Compartilhar
  const handleShare = async () => {
    try {
      await navigator.share({
        title: profile?.name,
        text: profile?.description,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link do perfil foi copiado para a área de transferência.",
      });
    }
  };

  // WhatsApp
  const handleWhatsApp = () => {
    const phone = "5521999999999"; // Substituir pelo telefone real do perfil
    const message = encodeURIComponent(`Olá ${profile?.name}, vi seu perfil e gostaria de mais informações.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Perfil não encontrado</h1>
          <p className="text-muted-foreground mb-6">O perfil que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate('/')}>Voltar para Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryName = categoryNames[profile.category || 'mulheres'] || 'Acompanhante';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${profile.name} - ${categoryName} em ${profile.location}`}
        description={profile.description || `${profile.name}, ${profile.age} anos. ${categoryName} em ${profile.location}.`}
      />
      
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Voltar */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Fotos */}
          <div className="lg:col-span-2 space-y-4">
            {/* Foto Principal */}
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/5] bg-muted">
                <img
                  src={mainPhoto}
                  alt={profile.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setIsLightboxOpen(true)}
                />
                
                {/* Navegação de fotos */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    {/* Indicadores */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {photos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPhotoIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {profile.verified && (
                    <Badge className="bg-green-500">
                      <Shield className="w-3 h-3 mr-1" />
                      Verificada
                    </Badge>
                  )}
                  {profile.featured && (
                    <Badge className="bg-amber-500">
                      <Star className="w-3 h-3 mr-1" />
                      Destaque
                    </Badge>
                  )}
                  {profile.isOnline && (
                    <Badge className="bg-emerald-500">Online</Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === currentPhotoIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Sobre */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {profile.description || 'Nenhuma descrição disponível.'}
                </p>
              </CardContent>
            </Card>

            {/* Serviços */}
            {profile.services && profile.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.services.map((service, idx) => (
                      <Badge key={idx} variant="secondary">{service}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Disponibilidade */}
            {profile.availability && profile.availability.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Horários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.availability.map((time, idx) => (
                      <Badge key={idx} variant="outline">{time}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Direita - Info e Contato */}
          <div className="space-y-4">
            {/* Card Principal */}
            <Card>
              <CardContent className="pt-6">
                {/* Nome e básicos */}
                <div className="text-center mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                    <AvatarImage src={profile.image} alt={profile.name} />
                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-muted-foreground">{profile.age} anos</p>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Preço */}
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">A partir de</p>
                  <p className="text-3xl font-bold text-primary">
                    R$ {profile.price?.toLocaleString('pt-BR')}
                    <span className="text-base font-normal text-muted-foreground">/hora</span>
                  </p>
                </div>

                {/* Botões de ação */}
                <div className="space-y-3">
                  <Button onClick={handleWhatsApp} className="w-full" size="lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp
                  </Button>
                  
                  <Button 
                    onClick={() => setIsMessageDialogOpen(true)} 
                    variant="secondary" 
                    className="w-full"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Enviar Mensagem
                  </Button>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => toggleFavorite(profile.id)}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${isFavorite(profile.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFavorite(profile.id) ? 'Salvo' : 'Salvar'}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleShare}>
                      <Share2 className="w-5 h-5 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Características */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Características</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.height && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Altura</span>
                    <span className="font-medium">{profile.height} cm</span>
                  </div>
                )}
                {profile.weight && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peso</span>
                    <span className="font-medium">{profile.weight} kg</span>
                  </div>
                )}
                {profile.eyeColor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Olhos</span>
                    <span className="font-medium">{profile.eyeColor}</span>
                  </div>
                )}
                {profile.hairColor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cabelo</span>
                    <span className="font-medium">{profile.hairColor}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoria</span>
                  <span className="font-medium">{categoryName}</span>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Camera className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="font-bold">{photos.length}</p>
                    <p className="text-xs text-muted-foreground">Fotos</p>
                  </div>
                  <div>
                    <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                    <p className="font-bold">{profile.rating?.toFixed(1) || '0.0'}</p>
                    <p className="text-xs text-muted-foreground">Avaliação</p>
                  </div>
                  <div>
                    <Eye className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="font-bold">{profile.views || 0}</p>
                    <p className="text-xs text-muted-foreground">Visualizações</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative aspect-[4/5] bg-black">
            <img
              src={photos[currentPhotoIndex]}
              alt={profile.name}
              className="w-full h-full object-contain"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <MessageDialog
        isOpen={isMessageDialogOpen}
        onClose={() => setIsMessageDialogOpen(false)}
        profileName={profile.name}
        profileId={profile.id}
      />
    </div>
  );
};

export default ProfileDetail;
