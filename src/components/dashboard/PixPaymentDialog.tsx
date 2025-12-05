import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PixPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
  qrCodeBase64: string;
  amount: number;
  itemName: string;
  onPaymentConfirmed?: () => void;
}

export default function PixPaymentDialog({
  isOpen,
  onClose,
  qrCode,
  qrCodeBase64,
  amount,
  itemName,
  onPaymentConfirmed,
}: PixPaymentDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(qrCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Pagamento via PIX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">{itemName}</p>
            <p className="text-2xl font-bold text-primary">
              R$ {amount.toFixed(2)}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-center">
              <img 
                src={qrCodeBase64} 
                alt="QR Code PIX" 
                className="w-48 h-48 rounded-lg border-2 border-border"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Escaneie o QR Code ou copie o código PIX
              </p>
              
              <div className="relative">
                <div className="bg-background border rounded-lg p-3 pr-12 max-h-20 overflow-auto">
                  <code className="text-xs break-all">{qrCode}</code>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-xs text-yellow-700 dark:text-yellow-500">
              ⚠️ Após realizar o pagamento, aguarde alguns instantes para a confirmação automática.
            </p>
          </div>

          <Button variant="outline" onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
