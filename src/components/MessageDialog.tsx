import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileName: string;
}

export const MessageDialog = ({ open, onOpenChange, profileName }: MessageDialogProps) => {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim().length < 20) {
      toast({
        title: "Mensagem muito curta",
        description: "Por favor, escreva pelo menos 20 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (message.trim().length > 500) {
      toast({
        title: "Mensagem muito longa",
        description: "Por favor, limite sua mensagem a 500 caracteres.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "✅ Mensagem enviada!",
      description: `${profileName} receberá sua mensagem em breve.`,
    });

    // Reset form
    setMessage("");
    setName("");
    setContact("");
    onOpenChange(false);
  };

  const charCount = message.length;
  const isValid = charCount >= 20 && charCount <= 500;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Mensagem</DialogTitle>
          <DialogDescription>
            Envie uma mensagem para {profileName}. Seu contato será compartilhado se fornecido.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome (opcional)</Label>
            <Input
              id="name"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contato (opcional)</Label>
            <Input
              id="contact"
              placeholder="WhatsApp, Telegram ou Email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem *</Label>
            <Textarea
              id="message"
              placeholder="Escreva sua mensagem aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={5}
              className="resize-none"
            />
            <p className={`text-sm ${isValid ? 'text-muted-foreground' : charCount > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {charCount}/500 caracteres {charCount < 20 && `(mínimo 20)`}
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Enviar Mensagem
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
