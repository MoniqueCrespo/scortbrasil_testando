import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, Eye, RotateCcw } from "lucide-react";
import { neighborhoodsByCity } from "@/data/locations";
import { useLocationData } from "@/hooks/useLocationData";
import { Checkbox } from "@/components/ui/checkbox";
import { useWizard } from "@/hooks/useWizard";
import { useAutoSave } from "@/hooks/useAutoSave";
import { ProgressSteps } from "@/components/ProgressSteps";
import { PillButton } from "@/components/PillButton";
import { CurrencyInput } from "@/components/CurrencyInput";
import { NeighborhoodSelector } from "@/components/NeighborhoodSelector";
import { PhotoUploader } from "@/components/PhotoUploader";
import { ProfilePreview } from "@/components/ProfilePreview";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { PublishSuccessDialog } from "@/components/PublishSuccessDialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { validateLocation, normalizeStateCode } from "@/lib/validation";

const categories = [
  { value: "mulheres", label: "Mulheres" },
  { value: "homens", label: "Homens" },
  { value: "trans", label: "Trans" },
  { value: "casais", label: "Casais" },
  { value: "massagistas", label: "Massagistas" },
];

const eyeColors = [
  { value: "castanhos", label: "Castanhos" },
  { value: "verdes", label: "Verdes" },
  { value: "azuis", label: "Azuis" },
  { value: "pretos", label: "Pretos" },
  { value: "mel", label: "Mel/Âmbar" },
  { value: "cinzas", label: "Cinzas" },
];

const hairColors = [
  { value: "preto", label: "Preto" },
  { value: "castanho", label: "Castanho" },
  { value: "loiro", label: "Loiro" },
  { value: "ruivo", label: "Ruivo" },
  { value: "grisalho", label: "Grisalho" },
  { value: "colorido", label: "Colorido" },
  { value: "outros", label: "Outros" },
];

const heights = Array.from({ length: 26 }, (_, i) => {
  const height = 150 + i * 5;
  return { value: height.toString(), label: `${height} cm` };
});

const weights = Array.from({ length: 31 }, (_, i) => {
  const weight = 40 + i * 5;
  return { value: weight.toString(), label: `${weight} kg` };
});

const bodyTypes = [
  { value: "magra", label: "Magra" },
  { value: "atletica", label: "Atlética" },
  { value: "curvilinea", label: "Curvilínea" },
  { value: "plus-size", label: "Plus Size" },
];

const ethnicities = [
  { value: "branca", label: "Branca" },
  { value: "negra", label: "Negra" },
  { value: "parda", label: "Parda" },
  { value: "asiatica", label: "Asiática" },
  { value: "indigena", label: "Indígena" },
];

const services = [
  "Beijo na boca",
  "Beijo grego",
  "Oral sem preservativo",
  "Oral com preservativo",
  "Massagem",
  "Inversão",
  "Acompanhamento",
  "Pernoite",
  "Viagens",
  "Dominação",
  "Submissão",
  "Fetiche",
  "Atendo em hotéis",
  "Atendo em motéis",
  "Tenho local",
  "Atendo casais",
  "Atendo mulheres",
  "Striptease",
  "Acessórios eróticos",
  "Fantasias",
  "Role play"
];

const weekDays = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

const timeSlots = [
  "Manhã (06:00 - 12:00)",
  "Tarde (12:00 - 18:00)",
  "Noite (18:00 - 00:00)",
  "Madrugada (00:00 - 06:00)",
  "24 Horas",
];

const steps = [
  { number: 1, title: "Fotos" },
  { number: 2, title: "Básico" },
  { number: 3, title: "Físico" },
  { number: 4, title: "Preço" },
  { number: 5, title: "Final" },
];

const CreateProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { states: brazilStates, cities, isLoadingCities, getCitiesByState } = useLocationData();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [publishedProfile, setPublishedProfile] = useState<any>(null);

  const { currentStep, completedSteps, goNext, goPrev } = useWizard(5);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    category: "mulheres",
    state: "",
    city: "",
    description: "",
    hourly_price: "",
    half_period_price: "",
    overnight_price: "",
    full_day_price: "",
    height: "",
    weight: "",
    eye_color: "",
    hair_color: "",
    body_type: "",
    ethnicity: "",
    phone: "",
    whatsapp: "",
    selectedServices: [] as string[],
    selectedNeighborhoods: [] as string[],
    availability_days: [] as string[],
    available_hours: [] as string[],
  });

  // Auto-save functionality
  const { loadSavedData, clearSavedData, isSaving } = useAutoSave({
    key: 'create-profile-draft',
    data: formData,
    interval: 30000, // Save every 30 seconds
    enabled: true,
  });

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadSavedData();
    if (savedData) {
      setShowRestoreDialog(true);
    }
  }, []);

  const restoreSavedData = () => {
    const savedData = loadSavedData();
    if (savedData) {
      setFormData(savedData);
      toast.success('Dados restaurados com sucesso!');
    }
    setShowRestoreDialog(false);
  };

  const discardSavedData = () => {
    clearSavedData();
    setShowRestoreDialog(false);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability_days: prev.availability_days.includes(day)
        ? prev.availability_days.filter(d => d !== day)
        : [...prev.availability_days, day]
    }));
  };

  const toggleTimeSlot = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      available_hours: prev.available_hours.includes(slot)
        ? prev.available_hours.filter(s => s !== slot)
        : [...prev.available_hours, slot]
    }));
  };

  const selectWeekdays = () => {
    const weekdays = weekDays.slice(0, 5);
    setFormData(prev => ({ ...prev, availability_days: weekdays }));
  };

  const selectWeekend = () => {
    const weekend = weekDays.slice(5, 7);
    setFormData(prev => ({ ...prev, availability_days: weekend }));
  };

  const selectAllDays = () => {
    setFormData(prev => ({ ...prev, availability_days: [...weekDays] }));
  };

  const handleServiceChange = (service: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter(s => s !== service)
        : [...prev.selectedServices, service]
    }));
  };

  const handleNeighborhoodChange = (neighborhood: string) => {
    setFormData(prev => ({
      ...prev,
      selectedNeighborhoods: prev.selectedNeighborhoods.includes(neighborhood)
        ? prev.selectedNeighborhoods.filter(n => n !== neighborhood)
        : [...prev.selectedNeighborhoods, neighborhood]
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (selectedPhotos.length < 4) {
      toast.error("Adicione pelo menos 4 fotos");
      return;
    }

    setIsLoading(true);

    try {
      // Validar e normalizar localização antes de criar
      const normalizedState = normalizeStateCode(formData.state);
      const locationValidation = validateLocation(normalizedState, formData.city);
      
      if (!locationValidation.isValid) {
        toast.error(`Erro de validação: ${locationValidation.error}`);
        setIsLoading(false);
        return;
      }
      
      // Verificar se a cidade selecionada é na verdade um bairro
      const { data: locationCheck } = await supabase
        .from('cities_seo')
        .select('is_neighborhood, parent_city_slug, city_name')
        .eq('city_slug', formData.city)
        .eq('state_code', normalizedState)
        .eq('is_active', true)
        .maybeSingle();
      
      let finalCitySlug = formData.city;
      let finalNeighborhoods = [...formData.selectedNeighborhoods];
      
      // Se é um bairro principal, usar cidade pai e adicionar bairro à lista
      if (locationCheck?.is_neighborhood && locationCheck.parent_city_slug) {
        finalCitySlug = locationCheck.parent_city_slug;
        // Adicionar o bairro à lista se ainda não estiver
        if (!finalNeighborhoods.includes(locationCheck.city_name)) {
          finalNeighborhoods.push(locationCheck.city_name);
        }
        console.log(`🏘️ Bairro detectado: ${locationCheck.city_name}, usando cidade pai: ${finalCitySlug}`);
      }

      // Upload photos
      const photoUrls: string[] = [];
      for (const photo of selectedPhotos) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);

        photoUrls.push(publicUrl);
      }

      console.log("📝 Criando anúncio com dados:", {
        user_id: user.id,
        category: formData.category,
        state: normalizedState, // Código validado (RJ, SP, etc)
        city: finalCitySlug, // Cidade final (pode ser cidade pai se bairro foi selecionado)
        neighborhoods: finalNeighborhoods,
        is_active: true,
      });

      // Insert profile
      const { error: insertError, data: newProfile } = await supabase
        .from('model_profiles')
        .insert({
          user_id: user.id,
          name: formData.name,
          age: parseInt(formData.age),
          category: formData.category,
          state: normalizedState, // Usar estado normalizado e validado
          city: finalCitySlug, // Usar cidade final
          description: formData.description,
          photo_url: photoUrls[0],
          photos: photoUrls,
          price: parseInt(formData.hourly_price) || 0,
          pricing: {
            hourly: parseInt(formData.hourly_price) || null,
            half_period: parseInt(formData.half_period_price) || null,
            overnight: parseInt(formData.overnight_price) || null,
            full_day: parseInt(formData.full_day_price) || null,
          },
          height: formData.height ? parseInt(formData.height) : null,
          weight: formData.weight ? parseInt(formData.weight) : null,
          eye_color: formData.eye_color || null,
          hair_color: formData.hair_color || null,
          body_type: formData.body_type || null,
          ethnicity: formData.ethnicity || null,
          phone: formData.phone || null,
          whatsapp: formData.whatsapp || null,
          services: formData.selectedServices,
          neighborhoods: finalNeighborhoods, // Usar lista final de bairros
          availability: formData.availability_days,
          available_hours: formData.available_hours,
          is_active: true,
          verified: false,
          featured: false,
        } as any)
        .select()
        .single();

      if (insertError) throw insertError;

      // Obter dados de estado e cidade para o log da URL
      const stateData = brazilStates.find(s => s.code === normalizedState);
      const cityData = cities.find(c => c.city_slug === formData.city && c.state_code === normalizedState);

      console.log("✅ Anúncio criado:", newProfile);
      console.log("🔗 URL pública:", `/acompanhantes/${stateData?.slug}/${cityData?.city_slug}${newProfile.category !== 'mulheres' ? `/${newProfile.category}` : ''}/${newProfile.slug || newProfile.id}`);

      // Clear auto-saved data after successful publish
      clearSavedData();

      // Armazenar dados do perfil publicado e mostrar modal de sucesso
      // Converter state code para slug para a URL funcionar corretamente
      const stateSlug = brazilStates.find(s => s.code === newProfile.state)?.slug || newProfile.state;
      
      setPublishedProfile({
        ...newProfile,
        state: stateSlug, // Usar slug do estado em vez do código
      });
      setShowSuccessDialog(true);
      
    } catch (error: any) {
      console.error("Erro ao criar anúncio:", error);
      toast.error(error.message || "Erro ao criar anúncio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate('/dashboard/modelo');
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return selectedPhotos.length >= 4;
      case 2:
        const stateValid = formData.state && brazilStates.find(s => s.code === formData.state);
        const cityValid = formData.city && availableCities.find(c => c.city_slug === formData.city);
        return !!(
          formData.name && 
          formData.age && 
          stateValid && 
          cityValid && 
          formData.category &&
          formData.description && 
          formData.description.length >= 50
        );
      case 3:
        return true; // Optional step
      case 4:
        return !!(formData.hourly_price && formData.availability_days.length > 0 && formData.available_hours.length > 0);
      case 5:
        return formData.selectedServices.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      if (currentStep === 5) {
        setShowConfirmation(true);
      } else {
        goNext();
      }
    }
  };

  const handleConfirmPublish = () => {
    setShowConfirmation(false);
    handleSubmit();
  };

  // Filtra cidades baseado no estado - AGUARDA carregamento completo
  const availableCities = useMemo(() => {
    // Se ainda está carregando, retorna array vazio
    if (isLoadingCities) {
      console.log('⏳ [CreateProfile] Aguardando carregamento de cidades...');
      return [];
    }
    
    // Se não tem estado selecionado, retorna vazio
    if (!formData.state) {
      console.log('⚠️ [CreateProfile] Nenhum estado selecionado');
      return [];
    }
    
    // Filtra cidades do estado
    const filtered = cities.filter(city => city.state_code === formData.state);
    
    console.log(`✅ [CreateProfile] Estado: ${formData.state} | Total cidades: ${cities.length} | Filtradas: ${filtered.length}`);
    if (filtered.length > 0) {
      console.log(`📋 [CreateProfile] Exemplos: ${filtered.slice(0, 3).map(c => c.city_name).join(', ')}`);
    }
    
    return filtered;
  }, [formData.state, cities, isLoadingCities]); // IMPORTANTE: incluir isLoadingCities

  const availableNeighborhoods = formData.city
    ? neighborhoodsByCity[formData.city] || neighborhoodsByCity.default
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Criar Novo Anúncio</h1>
                <p className="text-muted-foreground">Preencha as informações para publicar seu perfil</p>
              </div>
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </div>
              )}
            </div>
          </div>

          <ProgressSteps steps={steps} currentStep={currentStep} completedSteps={completedSteps} />

          <div className="grid lg:grid-cols-[1fr,350px] gap-6 mt-8">
            {/* Main Form */}
            <div>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {/* Step 1: Photos */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Upload de Fotos</CardTitle>
                        <CardDescription>
                          Adicione de 4 a 10 fotos do seu perfil. A primeira será a foto principal.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PhotoUploader
                          photos={selectedPhotos}
                          onPhotosChange={setSelectedPhotos}
                          maxPhotos={10}
                          minPhotos={4}
                        />
                      </CardContent>
                    </Card>

                    {/* Alerta de plano gratuito */}
                    {selectedPhotos.length > 4 && (
                      <Card className="border-yellow-500/20 bg-yellow-500/5">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                              ⚠️
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm mb-1">
                                Você tem {selectedPhotos.length} fotos
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                Seu plano gratuito mostra apenas 4 fotos públicas. Considere fazer upgrade para exibir todas as {selectedPhotos.length} fotos e aumentar sua visibilidade.
                              </p>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => window.open('/planos', '_blank')}
                              >
                                Ver Planos Premium
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Step 2: Basic Info */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Informações Básicas</CardTitle>
                        <CardDescription>Dados principais do seu perfil</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">
                              Nome <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Como deseja ser chamado(a)"
                                className={formData.name ? "border-green-500" : ""}
                              />
                              {formData.name && (
                                <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="age">
                              Idade <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              <Input
                                id="age"
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({...formData, age: e.target.value})}
                                placeholder="Sua idade"
                                className={formData.age && parseInt(formData.age) >= 18 ? "border-green-500" : formData.age ? "border-destructive" : ""}
                              />
                              {formData.age && parseInt(formData.age) >= 18 && (
                                <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                              )}
                            </div>
                            {formData.age && parseInt(formData.age) < 18 && (
                              <p className="text-xs text-destructive">Idade mínima: 18 anos</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Categoria</Label>
                          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="state">
                              Estado <span className="text-destructive">*</span>
                            </Label>
                            <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value, city: ""})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                              <SelectContent>
                                {brazilStates.map(state => (
                                  <SelectItem key={state.code} value={state.code}>{state.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="city">
                              Cidade <span className="text-destructive">*</span>
                              {formData.state && availableCities.length > 0 && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({availableCities.length} {availableCities.length === 1 ? 'cidade' : 'cidades'})
                                </span>
                              )}
                            </Label>
                            <Select 
                              value={formData.city} 
                              onValueChange={(value) => setFormData({...formData, city: value})} 
                              disabled={!formData.state || isLoadingCities}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  isLoadingCities 
                                    ? "⏳ Carregando cidades..." 
                                    : !formData.state 
                                    ? "⚠️ Primeiro selecione o estado" 
                                    : availableCities.length === 0 
                                      ? "❌ Nenhuma cidade disponível" 
                                      : "Selecione a cidade"
                                } />
                              </SelectTrigger>
                              <SelectContent>
                                {!isLoadingCities && availableCities.length === 0 && formData.state && (
                                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    Nenhuma cidade encontrada para este estado
                                  </div>
                                )}
                                {availableCities.map(city => (
                                  <SelectItem key={city.id} value={city.city_slug}>{city.city_name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">
                            Descrição <span className="text-destructive">*</span>
                            <span className="text-xs text-muted-foreground ml-2">(mínimo 50 caracteres)</span>
                          </Label>
                          <div className="relative">
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              placeholder="Descreva você, seus diferenciais e o que oferece..."
                              maxLength={500}
                              rows={4}
                              className={formData.description.length >= 50 ? "border-green-500" : formData.description.length > 0 ? "border-yellow-500" : ""}
                            />
                            {formData.description.length >= 50 && (
                              <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <p className={formData.description.length < 50 && formData.description.length > 0 ? "text-yellow-600" : "text-muted-foreground"}>
                              {formData.description.length < 50 && formData.description.length > 0 
                                ? `Faltam ${50 - formData.description.length} caracteres` 
                                : formData.description.length >= 50 
                                  ? "✓ Descrição completa" 
                                  : "Descrição obrigatória"}
                            </p>
                            <p className="text-muted-foreground">
                              {formData.description.length}/500
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bairros de Atendimento - Aparece após cidade selecionada */}
                    {formData.city && availableNeighborhoods.length > 0 && (
                      <NeighborhoodSelector
                        availableNeighborhoods={availableNeighborhoods}
                        selectedNeighborhoods={formData.selectedNeighborhoods}
                        onNeighborhoodChange={handleNeighborhoodChange}
                      />
                    )}
                  </div>
                )}

                {/* Step 3: Physical Characteristics */}
                {currentStep === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Características Físicas</CardTitle>
                      <CardDescription>Informações opcionais sobre aparência</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="height">Altura <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                          <Select value={formData.height} onValueChange={(value) => setFormData({...formData, height: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {heights.map(h => (
                                <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="weight">Peso <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                          <Select value={formData.weight} onValueChange={(value) => setFormData({...formData, weight: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {weights.map(w => (
                                <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="eye_color">Cor dos Olhos</Label>
                          <Select value={formData.eye_color} onValueChange={(value) => setFormData({...formData, eye_color: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {eyeColors.map(c => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hair_color">Cor do Cabelo</Label>
                          <Select value={formData.hair_color} onValueChange={(value) => setFormData({...formData, hair_color: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {hairColors.map(c => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="body_type">Tipo Físico</Label>
                          <Select value={formData.body_type} onValueChange={(value) => setFormData({...formData, body_type: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {bodyTypes.map(bt => (
                                <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ethnicity">Etnia</Label>
                          <Select value={formData.ethnicity} onValueChange={(value) => setFormData({...formData, ethnicity: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {ethnicities.map(e => (
                                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 4: Pricing & Availability */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Preços</CardTitle>
                        <CardDescription>Defina os valores dos seus atendimentos</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="hourly_price">
                              Preço por Hora <span className="text-destructive">*</span>
                            </Label>
                            <CurrencyInput
                              value={formData.hourly_price}
                              onChange={(value) => setFormData({...formData, hourly_price: value})}
                              placeholder="R$ 0,00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="half_period_price">
                              Meio Período (4h) <span className="text-xs text-muted-foreground">(opcional)</span>
                            </Label>
                            <CurrencyInput
                              value={formData.half_period_price}
                              onChange={(value) => setFormData({...formData, half_period_price: value})}
                              placeholder="R$ 0,00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="overnight_price">
                              Pernoite <span className="text-xs text-muted-foreground">(opcional)</span>
                            </Label>
                            <CurrencyInput
                              value={formData.overnight_price}
                              onChange={(value) => setFormData({...formData, overnight_price: value})}
                              placeholder="R$ 0,00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="full_day_price">
                              Dia Completo <span className="text-xs text-muted-foreground">(opcional)</span>
                            </Label>
                            <CurrencyInput
                              value={formData.full_day_price}
                              onChange={(value) => setFormData({...formData, full_day_price: value})}
                              placeholder="R$ 0,00"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Disponibilidade</CardTitle>
                        <CardDescription>Quando você atende?</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>
                              Dias de Atendimento <span className="text-destructive">*</span>
                            </Label>
                            <div className="flex gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={selectWeekdays}>
                                Seg-Sex
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={selectWeekend}>
                                Fim de Semana
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={selectAllDays}>
                                Todos
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {weekDays.map(day => (
                              <PillButton
                                key={day}
                                selected={formData.availability_days.includes(day)}
                                onClick={() => toggleDay(day)}
                              >
                                {day.substring(0, 3)}
                              </PillButton>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>
                            Horários Disponíveis <span className="text-destructive">*</span>
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {timeSlots.map(slot => (
                              <PillButton
                                key={slot}
                                selected={formData.available_hours.includes(slot)}
                                onClick={() => toggleTimeSlot(slot)}
                              >
                                {slot}
                              </PillButton>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Step 5: Services & Contact */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Serviços Oferecidos</CardTitle>
                        <CardDescription>
                          Selecione os serviços que você oferece <span className="text-destructive">*</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {services.map(service => (
                            <div key={service} className="flex items-center space-x-2">
                              <Checkbox
                                id={service}
                                checked={formData.selectedServices.includes(service)}
                                onCheckedChange={() => handleServiceChange(service)}
                              />
                              <label
                                htmlFor={service}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {service}
                              </label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Informações de Contato</CardTitle>
                        <CardDescription>Como os clientes podem te contatar?</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="(11) 99999-9999"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="whatsapp">WhatsApp <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                          <Input
                            id="whatsapp"
                            type="tel"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goPrev}
                    disabled={currentStep === 1 || isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>

                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStepValid(currentStep) || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publicando...
                      </>
                    ) : currentStep === 5 ? (
                      "Publicar Anúncio"
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Desktop Preview Sidebar */}
            <div className="hidden lg:block">
              <ProfilePreview formData={formData} photos={selectedPhotos} />
            </div>

            {/* Mobile Preview Button */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="lg" className="rounded-full shadow-lg">
                    <Eye className="mr-2 h-5 w-5" />
                    Preview
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                  <ProfilePreview formData={formData} photos={selectedPhotos} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Restore Dialog */}
        <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Restaurar Progresso
              </AlertDialogTitle>
              <AlertDialogDescription>
                Encontramos um rascunho salvo anteriormente. Deseja restaurá-lo?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={discardSavedData}>
                Descartar
              </AlertDialogCancel>
              <AlertDialogAction onClick={restoreSavedData}>
                Restaurar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={showConfirmation}
          onConfirm={handleConfirmPublish}
          onCancel={() => setShowConfirmation(false)}
          formData={formData}
          photosCount={selectedPhotos.length}
        />

        {/* Success Dialog */}
        {publishedProfile && (
          <PublishSuccessDialog
            open={showSuccessDialog}
            onClose={handleSuccessDialogClose}
            profileData={publishedProfile}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CreateProfile;
