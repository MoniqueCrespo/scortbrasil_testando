import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, Eye, RotateCcw, X, Save } from "lucide-react";
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
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
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

const EditProfile = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { states, cities, isLoadingCities, getCitiesByState, getNeighborhoodsByCity } = useLocationData();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [publishedProfile, setPublishedProfile] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ step: '', percent: 0 });
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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
    telegram: "",
    selectedServices: [] as string[],
    selectedNeighborhoods: [] as string[],
    availability_days: [] as string[],
    available_hours: [] as string[],
  });

  // Auto-save functionality (disabled for edit mode)
  const { isSaving } = useAutoSave({
    key: `edit-profile-${profileId}`,
    data: formData,
    interval: 30000,
    enabled: false, // Disabled for edit to prevent conflicts
  });

  // Detect changes
  useEffect(() => {
    if (originalData) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalData) || 
                     selectedPhotos.length > 0 || 
                     photosToDelete.length > 0;
      setHasChanges(changed);
    }
  }, [formData, originalData, selectedPhotos, photosToDelete]);

  // Aguardar carregamento de cidades antes de buscar perfil
  useEffect(() => {
    if (!isLoadingCities && profileId && user) {
      console.log('✅ [EditProfile] Cidades carregadas, iniciando fetchProfile');
      fetchProfile();
    } else if (isLoadingCities) {
      console.log('⏳ [EditProfile] Aguardando carregamento de cidades...');
    }
  }, [isLoadingCities, profileId, user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('model_profiles')
        .select('*')
        .eq('id', profileId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        const pricing = data.pricing as any || {};
        
        // Converter state de slug para code se necessário (migração de dados antigos)
        let stateValue = data.state;
        console.log('🔍 [fetchProfile] State original do banco:', data.state);
        console.log('🔍 [fetchProfile] City original do banco:', data.city);
        
        if (stateValue && stateValue.includes('-')) {
          // É um slug, converter para code
          const stateObj = states.find(s => s.slug === stateValue);
          stateValue = stateObj ? stateObj.code : stateValue;
          console.log('🔄 [fetchProfile] State convertido de slug para code:', stateValue);
        } else if (stateValue && stateValue.length > 2) {
          // Pode ser o nome completo do estado, tentar encontrar pelo nome
          const stateObj = states.find(s => 
            s.name.toLowerCase() === stateValue.toLowerCase() || 
            s.slug === stateValue.toLowerCase()
          );
          if (stateObj) {
            stateValue = stateObj.code;
            console.log('🔄 [fetchProfile] State convertido de nome para code:', stateValue);
          }
        }
        
        console.log('✅ [fetchProfile] State final que será usado:', stateValue);
        console.log('✅ [fetchProfile] City que será usado:', data.city);
        console.log('🔢 [fetchProfile] Total cidades no cache:', cities.length);
        
        const loadedData = {
          name: data.name,
          age: data.age.toString(),
          category: data.category,
          state: stateValue,
          city: data.city,
          description: data.description || "",
          hourly_price: pricing.hourly?.toString() || "",
          half_period_price: pricing.half_period?.toString() || "",
          overnight_price: pricing.overnight?.toString() || "",
          full_day_price: pricing.full_day?.toString() || "",
          height: data.height?.toString() || "",
          weight: data.weight?.toString() || "",
          eye_color: data.eye_color || "",
          hair_color: data.hair_color || "",
          body_type: data.body_type || "",
          ethnicity: data.ethnicity || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          telegram: data.telegram || "",
          selectedServices: data.services || [],
          selectedNeighborhoods: data.neighborhoods || [],
          availability_days: data.availability || [],
          available_hours: data.available_hours || [],
        };
        setFormData(loadedData);
        setOriginalData(loadedData);
        setExistingPhotoUrls(data.photos || []);
        setLastUpdated(data.updated_at);
        
        console.log('✅ [fetchProfile] FormData carregado com sucesso');
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setIsFetching(false);
    }
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
    if (!user || !profileId) {
      toast.error("Erro de autenticação");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Salvando alterações...");

    try {
      // Deletar fotos marcadas
      setSaveProgress({ step: 'Removendo fotos antigas...', percent: 10 });
      for (const url of photosToDelete) {
        const path = url.split('/profile-photos/')[1];
        if (path) {
          await supabase.storage.from('profile-photos').remove([path]);
        }
      }

      let photoUrls = existingPhotoUrls.filter(url => !photosToDelete.includes(url));

      // Upload new photos if any
      if (selectedPhotos.length > 0) {
        setSaveProgress({ step: 'Enviando fotos novas...', percent: 30 });
        for (const photo of selectedPhotos) {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(filePath, photo);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filePath);

          photoUrls.push(publicUrl);
        }
      }

      // Validar localização antes de salvar
      const normalizedState = normalizeStateCode(formData.state);
      const locationValidation = validateLocation(normalizedState, formData.city);
      
      if (!locationValidation.isValid) {
        toast.error(`Erro de validação: ${locationValidation.error}`);
        setSaveProgress(null);
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

      // Update profile
      setSaveProgress({ step: 'Atualizando perfil...', percent: 70 });
      const { data: updatedProfile, error: updateError } = await supabase
        .from('model_profiles')
        .update({
          name: formData.name,
          age: parseInt(formData.age),
          category: formData.category,
          state: normalizedState, // Usar estado normalizado
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
          telegram: formData.telegram || null,
          services: formData.selectedServices,
          neighborhoods: finalNeighborhoods, // Usar lista final de bairros
          availability: formData.availability_days,
          available_hours: formData.available_hours,
        })
        .eq('id', profileId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSaveProgress({ step: 'Concluído!', percent: 100 });
      toast.success("Alterações salvas com sucesso!", { id: toastId });
      
      setPublishedProfile(updatedProfile);
      setShowSuccessDialog(true);
      setPhotosToDelete([]);
      setSelectedPhotos([]);
    } catch (error: any) {
      console.error("Erro ao atualizar anúncio:", error);
      toast.error(error.message || "Erro ao atualizar anúncio", { id: toastId });
    } finally {
      setIsLoading(false);
      setSaveProgress({ step: '', percent: 0 });
    }
  };

  const handleRemoveExistingPhoto = (url: string) => {
    setPhotosToDelete(prev => [...prev, url]);
    setExistingPhotoUrls(prev => prev.filter(u => u !== url));
  };

  const handleCancelChanges = () => {
    if (originalData) {
      setFormData(originalData);
      setSelectedPhotos([]);
      setPhotosToDelete([]);
      fetchProfile(); // Reload existing photos
      setShowCancelDialog(false);
      toast.info("Alterações descartadas");
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate('/dashboard/modelo');
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return (selectedPhotos.length + existingPhotoUrls.length) >= 4;
      case 2:
        const stateValid = formData.state && states.find(s => s.code === formData.state);
        const cityValid = formData.city && availableCities.find(c => c.city_slug === formData.city);
        return !!(formData.name && formData.age && stateValid && cityValid);
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

  const selectedState = formData.state
    ? states.find(s => s.code === formData.state)
    : null;
  
  // Filtra cidades baseado no estado - AGUARDA carregamento completo
  const availableCities = useMemo(() => {
    // Se ainda está carregando, retorna array vazio
    if (isLoadingCities) {
      console.log('⏳ [EditProfile] Aguardando carregamento de cidades...');
      return [];
    }
    
    // Se não tem estado selecionado, retorna vazio
    if (!formData.state) {
      console.log('⚠️ [EditProfile] Nenhum estado selecionado');
      return [];
    }
    
    // USA getCitiesByState que é a função correta do hook
    const filtered = getCitiesByState(formData.state);
    
    console.log(`✅ [EditProfile] Estado: ${formData.state} | Total cidades disponíveis: ${filtered.length}`);
    if (filtered.length > 0) {
      console.log(`📋 [EditProfile] Exemplos: ${filtered.slice(0, 3).map(c => c.city_name).join(', ')}`);
    } else {
      console.error(`❌ [EditProfile] NENHUMA cidade encontrada para ${formData.state}!`);
    }
    
    return filtered;
  }, [formData.state, getCitiesByState, isLoadingCities]);

  const availableNeighborhoods = formData.city
    ? getNeighborhoodsByCity(formData.city)
    : [];

  // Convert existing URLs to File objects for display in PhotoUploader
  const allPhotosForDisplay = selectedPhotos;

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Editar Anúncio</h1>
                <div className="flex flex-col gap-1">
                  <p className="text-muted-foreground">Atualize as informações do seu perfil</p>
                  {lastUpdated && (
                    <p className="text-sm text-muted-foreground">
                      Última atualização: {formatDistanceToNow(new Date(lastUpdated), { 
                        locale: ptBR,
                        addSuffix: true 
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelDialog(true)}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Descartar Alterações
                  </Button>
                )}
                {saveProgress.percent > 0 && saveProgress.percent < 100 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {saveProgress.step}
                  </div>
                )}
              </div>
            </div>
          </div>

          <ProgressSteps steps={steps} currentStep={currentStep} completedSteps={completedSteps} />

          <div className="grid lg:grid-cols-[1fr,350px] gap-6 mt-8">
            {/* Main Form - Same as CreateProfile but with edit mode */}
            <div>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {/* Step 1: Photos */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Fotos do Perfil</CardTitle>
                        <CardDescription>
                          {existingPhotoUrls.length > 0 && `${existingPhotoUrls.length} foto${existingPhotoUrls.length !== 1 ? 's' : ''} atual${existingPhotoUrls.length !== 1 ? 's' : ''}. `}
                          Adicione mais fotos ou mantenha as existentes.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Show existing photos with remove functionality */}
                        {existingPhotoUrls.length > 0 && (
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <Label>Fotos Atuais</Label>
                              <span className="text-sm text-muted-foreground">
                                {existingPhotoUrls.length + selectedPhotos.length} / 10 fotos
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {existingPhotoUrls.map((url, index) => (
                                <div key={url} className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/20 group">
                                  <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                  {index === 0 && (
                                    <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                      Principal
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExistingPhoto(url)}
                                    className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remover foto"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {(existingPhotoUrls.length + selectedPhotos.length) < 10 && (
                          <div>
                            <Label className="mb-2 block">
                              {existingPhotoUrls.length > 0 ? 'Adicionar Mais Fotos' : 'Adicionar Fotos'}
                            </Label>
                            <PhotoUploader
                              photos={selectedPhotos}
                              onPhotosChange={setSelectedPhotos}
                              maxPhotos={10 - existingPhotoUrls.length}
                              minPhotos={Math.max(0, 4 - existingPhotoUrls.length)}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Alerta de plano gratuito */}
                    {(existingPhotoUrls.length + selectedPhotos.length) > 4 && (
                      <Card className="border-yellow-500/20 bg-yellow-500/5">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                              ⚠️
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm mb-1">
                                Você tem {existingPhotoUrls.length + selectedPhotos.length} fotos
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                Seu plano gratuito mostra apenas 4 fotos públicas. Considere fazer upgrade para exibir todas as {existingPhotoUrls.length + selectedPhotos.length} fotos e aumentar sua visibilidade.
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

                {/* Steps 2-5: Reuse same JSX from CreateProfile */}
                {currentStep === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Básicas</CardTitle>
                      <CardDescription>
                        Detalhes sobre você.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nome</Label>
                          <Input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="age">Idade</Label>
                          <Input
                            type="number"
                            id="age"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="category">Categoria</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="state">Estado</Label>
                          <Select 
                            value={formData.state} 
                            onValueChange={(value) => setFormData({ ...formData, state: value, city: "", selectedNeighborhoods: [] })}
                            disabled={isLoadingCities}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione um estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {states.map((state) => (
                                <SelectItem key={state.code} value={state.code}>
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="city">Cidade</Label>
                          <Select 
                            value={formData.city} 
                            onValueChange={(value) => setFormData({ ...formData, city: value, selectedNeighborhoods: [] })}
                            disabled={!formData.state || isLoadingCities}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={
                                isLoadingCities 
                                  ? "⏳ Carregando cidades..." 
                                  : !formData.state 
                                  ? "⚠️ Selecione um estado primeiro" 
                                  : availableCities.length === 0
                                  ? "❌ Nenhuma cidade disponível"
                                  : "Selecione uma cidade"
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {!isLoadingCities && availableCities.length === 0 && formData.state && (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                  Nenhuma cidade encontrada para {selectedState?.name}
                                </div>
                              )}
                              {availableCities.map((city) => (
                                <SelectItem key={city.city_slug} value={city.city_slug}>
                                  {city.city_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          placeholder="Fale sobre você"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Bairros de Atendimento - Aparece após cidade selecionada */}
                {currentStep === 2 && formData.city && availableNeighborhoods.length > 0 && (
                  <NeighborhoodSelector
                    availableNeighborhoods={availableNeighborhoods}
                    selectedNeighborhoods={formData.selectedNeighborhoods}
                    onNeighborhoodChange={handleNeighborhoodChange}
                  />
                )}

                {currentStep === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Características Físicas</CardTitle>
                      <CardDescription>
                        Detalhes sobre sua aparência.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="height">Altura</Label>
                          <Select value={formData.height} onValueChange={(value) => setFormData({ ...formData, height: value })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione sua altura" />
                            </SelectTrigger>
                            <SelectContent>
                              {heights.map((height) => (
                                <SelectItem key={height.value} value={height.value}>
                                  {height.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="weight">Peso</Label>
                          <Select value={formData.weight} onValueChange={(value) => setFormData({ ...formData, weight: value })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione seu peso" />
                            </SelectTrigger>
                            <SelectContent>
                              {weights.map((weight) => (
                                <SelectItem key={weight.value} value={weight.value}>
                                  {weight.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="eye_color">Cor dos Olhos</Label>
                          <Select value={formData.eye_color} onValueChange={(value) => setFormData({ ...formData, eye_color: value })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione a cor dos olhos" />
                            </SelectTrigger>
                            <SelectContent>
                              {eyeColors.map((color) => (
                                <SelectItem key={color.value} value={color.value}>
                                  {color.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="hair_color">Cor do Cabelo</Label>
                          <Select value={formData.hair_color} onValueChange={(value) => setFormData({ ...formData, hair_color: value })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione a cor do cabelo" />
                            </SelectTrigger>
                            <SelectContent>
                              {hairColors.map((color) => (
                                <SelectItem key={color.value} value={color.value}>
                                  {color.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="body_type">Tipo de Corpo</Label>
                          <Select value={formData.body_type} onValueChange={(value) => setFormData({ ...formData, body_type: value })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o tipo de corpo" />
                            </SelectTrigger>
                            <SelectContent>
                              {bodyTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="ethnicity">Etnia</Label>
                          <Select value={formData.ethnicity} onValueChange={(value) => setFormData({ ...formData, ethnicity: value })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione a etnia" />
                            </SelectTrigger>
                            <SelectContent>
                              {ethnicities.map((ethnicity) => (
                                <SelectItem key={ethnicity.value} value={ethnicity.value}>
                                  {ethnicity.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep === 4 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Preços e Horários</CardTitle>
                      <CardDescription>
                        Defina seus preços e horários de atendimento.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hourly_price">Preço por Hora</Label>
                          <CurrencyInput
                            value={formData.hourly_price}
                            onChange={(value) => setFormData({ ...formData, hourly_price: value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="half_period_price">Preço Meio Período</Label>
                          <CurrencyInput
                            value={formData.half_period_price}
                            onChange={(value) => setFormData({ ...formData, half_period_price: value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="overnight_price">Preço Pernoite</Label>
                          <CurrencyInput
                            value={formData.overnight_price}
                            onChange={(value) => setFormData({ ...formData, overnight_price: value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="full_day_price">Preço Dia Inteiro</Label>
                          <CurrencyInput
                            value={formData.full_day_price}
                            onChange={(value) => setFormData({ ...formData, full_day_price: value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Disponibilidade</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <PillButton selected={false} onClick={selectWeekdays}>
                            Dias de Semana
                          </PillButton>
                          <PillButton selected={false} onClick={selectWeekend}>
                            Fim de Semana
                          </PillButton>
                          <PillButton selected={false} onClick={selectAllDays}>
                            Todos os Dias
                          </PillButton>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {weekDays.map((day) => (
                            <PillButton
                              key={day}
                              selected={formData.availability_days.includes(day)}
                              onClick={() => toggleDay(day)}
                            >
                              {day}
                            </PillButton>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Horários Disponíveis</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {timeSlots.map((slot) => (
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
                )}

                {currentStep === 5 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Serviços e Contato</CardTitle>
                      <CardDescription>
                        Quais serviços você oferece e como entrar em contato.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div>
                        <Label>Serviços</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {services.map((service) => (
                            <PillButton
                              key={service}
                              selected={formData.selectedServices.includes(service)}
                              onClick={() => handleServiceChange(service)}
                            >
                              {service}
                            </PillButton>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            type="tel"
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="whatsapp">WhatsApp</Label>
                          <Input
                            type="tel"
                            id="whatsapp"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="telegram">Telegram</Label>
                          <Input
                            type="text"
                            id="telegram"
                            value={formData.telegram}
                            onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                    className="gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : currentStep === 5 ? (
                      <>
                        <Save className="h-4 w-4" />
                        Salvar Alterações
                      </>
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Desktop Preview Sidebar */}
            <div className="hidden lg:block">
              <ProfilePreview 
                formData={formData} 
                photos={selectedPhotos}
                existingPhotoUrls={existingPhotoUrls}
              />
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
                  <ProfilePreview 
                    formData={formData} 
                    photos={selectedPhotos}
                    existingPhotoUrls={existingPhotoUrls}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={showConfirmation}
          onConfirm={handleConfirmPublish}
          onCancel={() => setShowConfirmation(false)}
          formData={formData}
          photosCount={selectedPhotos.length + existingPhotoUrls.length}
        />

        {/* Success Dialog */}
        {publishedProfile && (
          <PublishSuccessDialog
            open={showSuccessDialog}
            onClose={handleSuccessDialogClose}
            profileData={publishedProfile}
          />
        )}

        {/* Cancel Changes Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
              <AlertDialogDescription>
                Todas as alterações não salvas serão perdidas. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continuar Editando</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelChanges} className="bg-destructive hover:bg-destructive/90">
                Descartar Alterações
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      <Footer />
    </div>
  );
};

export default EditProfile;
