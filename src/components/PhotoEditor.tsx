import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sliders } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";

interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  filter: 'none' | 'grayscale' | 'sepia' | 'blur' | 'vintage';
}

interface PhotoEditorProps {
  image: string;
  open: boolean;
  onComplete: (editedBlob: Blob) => void;
  onCancel: () => void;
}

export const PhotoEditor = ({ image, open, onComplete, onCancel }: PhotoEditorProps) => {
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    filter: 'none',
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Aplicar ajustes em tempo real
  const applyAdjustments = useCallback(async () => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = image;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Limpar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Aplicar filtros CSS via canvas
      let filterString = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;

      if (adjustments.filter === 'grayscale') {
        filterString += ' grayscale(100%)';
      } else if (adjustments.filter === 'sepia') {
        filterString += ' sepia(100%)';
      } else if (adjustments.filter === 'blur') {
        filterString += ' blur(2px)';
      } else if (adjustments.filter === 'vintage') {
        filterString = 'sepia(50%) contrast(110%) brightness(110%) saturate(80%)';
      }

      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0);

      // Gerar preview URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      }, 'image/jpeg', 0.92);
    };
  }, [image, adjustments]);

  useEffect(() => {
    applyAdjustments();
  }, [applyAdjustments]);

  const handleApply = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onComplete(blob);
      }
    }, 'image/jpeg', 0.92);
  };

  const resetAdjustments = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      filter: 'none',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Editar Foto
          </DialogTitle>
          <DialogDescription>
            Ajuste brilho, contraste, saturação e aplique filtros
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preview */}
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
            <canvas ref={canvasRef} className="hidden" />
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            )}
          </div>

          {/* Controles */}
          <div className="space-y-4">
            {/* Brilho */}
            <div className="space-y-2">
              <Label>Brilho: {adjustments.brightness}%</Label>
              <Slider
                value={[adjustments.brightness]}
                onValueChange={([value]) => setAdjustments(prev => ({ ...prev, brightness: value }))}
                min={0}
                max={200}
                step={1}
              />
            </div>

            {/* Contraste */}
            <div className="space-y-2">
              <Label>Contraste: {adjustments.contrast}%</Label>
              <Slider
                value={[adjustments.contrast]}
                onValueChange={([value]) => setAdjustments(prev => ({ ...prev, contrast: value }))}
                min={0}
                max={200}
                step={1}
              />
            </div>

            {/* Saturação */}
            <div className="space-y-2">
              <Label>Saturação: {adjustments.saturation}%</Label>
              <Slider
                value={[adjustments.saturation]}
                onValueChange={([value]) => setAdjustments(prev => ({ ...prev, saturation: value }))}
                min={0}
                max={200}
                step={1}
              />
            </div>

            {/* Filtros */}
            <div className="space-y-2">
              <Label>Filtro</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'none' as const, label: 'Normal' },
                  { value: 'grayscale' as const, label: 'P&B' },
                  { value: 'sepia' as const, label: 'Sépia' },
                  { value: 'blur' as const, label: 'Desfoque' },
                  { value: 'vintage' as const, label: 'Vintage' },
                ].map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={adjustments.filter === value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAdjustments(prev => ({ ...prev, filter: value }))}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <Button
              variant="outline"
              className="w-full"
              onClick={resetAdjustments}
            >
              Resetar Ajustes
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleApply}>Aplicar Edição</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
