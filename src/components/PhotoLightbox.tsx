import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PhotoLightboxProps {
  photos: File[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const PhotoLightbox = ({ photos, currentIndex, open, onClose, onNavigate }: PhotoLightboxProps) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Reset zoom quando mudar de foto
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) {
        onNavigate(currentIndex + 1);
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        setZoom(prev => Math.min(prev + 0.5, 3));
      } else if (e.key === '-') {
        setZoom(prev => Math.max(prev - 0.5, 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, photos.length, onNavigate, onClose]);

  if (!photos[currentIndex]) return null;

  const currentPhoto = photos[currentIndex];
  const imageUrl = URL.createObjectURL(currentPhoto);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-xl h-screen p-0 bg-black border-0">
        {/* Header com contador e controles */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between">
          <div className="text-white font-medium text-lg">
            {currentIndex + 1} / {photos.length}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setZoom(prev => Math.max(prev - 0.5, 1));
              }}
              disabled={zoom <= 1}
            >
              <ZoomOut className="h-5 w-5 text-white" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setZoom(prev => Math.min(prev + 0.5, 3));
              }}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-5 w-5 text-white" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-red-500 hover:scale-110 transition-all h-10 w-10"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>

        {/* Área de imagem com zoom */}
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
          <img
            src={imageUrl}
            alt={`Foto ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain transition-transform cursor-move select-none"
            style={{
              transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
            }}
            onMouseDown={(e) => {
              if (zoom <= 1) return;
              
              const startX = e.clientX - position.x;
              const startY = e.clientY - position.y;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                setPosition({ 
                  x: moveEvent.clientX - startX, 
                  y: moveEvent.clientY - startY 
                });
              };

              const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
              };

              window.addEventListener('mousemove', handleMouseMove);
              window.addEventListener('mouseup', handleMouseUp);
            }}
            draggable={false}
          />
        </div>

        {/* Navegação (setas laterais) */}
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => onNavigate(currentIndex - 1)}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}
        {currentIndex < photos.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => onNavigate(currentIndex + 1)}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        {/* Thumbnails na parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
          <div className="flex gap-2 overflow-x-auto">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => onNavigate(index)}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all",
                  index === currentIndex ? "border-primary scale-110" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
