import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle, XCircle, Clock } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type ModelProfile = Tables<"model_profiles">;
type VerificationRequest = Tables<"verification_requests">;

const ProfileVerification = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<ModelProfile[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [documentType, setDocumentType] = useState("RG");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfiles();
    fetchVerificationRequests();
  }, []);

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('model_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error(error);
    }
  };

  const fetchVerificationRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerificationRequests(data || []);
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo deve ter no máximo 5MB");
        return;
      }
      setDocumentFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedProfile || !documentFile) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      // Upload document
      const fileExt = documentFile.name.split('.').pop();
      const fileName = `${user.id}/${selectedProfile}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(fileName, documentFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('verification-docs')
        .getPublicUrl(fileName);

      // Create verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          profile_id: selectedProfile,
          document_type: documentType,
          document_url: publicUrl,
          status: 'pending',
        });

      if (requestError) throw requestError;

      toast.success("Solicitação de verificação enviada com sucesso!");
      setSelectedProfile("");
      setDocumentType("RG");
      setDocumentFile(null);
      fetchVerificationRequests();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao enviar solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      default:
        return 'Aguardando análise';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] bg-clip-text text-transparent mb-2">
            Verificação de Perfil
          </h1>
          <p className="text-muted-foreground mb-8">
            Envie seus documentos para verificar seu perfil e ganhar o selo de verificado
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Solicitar Verificação</CardTitle>
                <CardDescription>
                  Envie uma foto do seu documento para verificação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile">Selecione o Perfil</Label>
                    <Select
                      value={selectedProfile}
                      onValueChange={setSelectedProfile}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.map(profile => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name} - {profile.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="docType">Tipo de Documento</Label>
                    <Select
                      value={documentType}
                      onValueChange={setDocumentType}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RG">RG</SelectItem>
                        <SelectItem value="CNH">CNH</SelectItem>
                        <SelectItem value="PASSAPORTE">Passaporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="document">Foto do Documento</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      {documentFile ? (
                        <div className="space-y-2">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                          <p className="text-sm font-medium">{documentFile.name}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDocumentFile(null)}
                          >
                            Remover
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">
                            Clique para selecionar
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Máximo 5MB - JPG, PNG ou PDF
                          </p>
                          <input
                            id="document"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={isLoading}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90"
                    disabled={isLoading || !selectedProfile || !documentFile}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar Solicitação
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Minhas Solicitações</CardTitle>
                <CardDescription>
                  Acompanhe o status das suas verificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verificationRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma solicitação enviada
                  </p>
                ) : (
                  <div className="space-y-4">
                    {verificationRequests.map(request => {
                      const profile = profiles.find(p => p.id === request.profile_id);
                      return (
                        <div
                          key={request.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{profile?.name}</p>
                            {getStatusIcon(request.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Documento: {request.document_type}
                          </p>
                          <p className="text-sm">
                            Status: <span className="font-medium">{getStatusLabel(request.status)}</span>
                          </p>
                          {request.status === 'rejected' && request.rejection_reason && (
                            <p className="text-sm text-red-500">
                              Motivo: {request.rejection_reason}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Enviado em: {new Date(request.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileVerification;