import { useState, KeyboardEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/PillButton";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface NeighborhoodSelectorProps {
  availableNeighborhoods: string[];
  selectedNeighborhoods: string[];
  onNeighborhoodChange: (neighborhood: string) => void;
}

export const NeighborhoodSelector = ({
  availableNeighborhoods,
  selectedNeighborhoods,
  onNeighborhoodChange,
}: NeighborhoodSelectorProps) => {
  const [manualInput, setManualInput] = useState("");

  // Detecta se os bairros são genéricos (fallback) ou reais
  const isGenericFallback =
    availableNeighborhoods.length === 5 &&
    availableNeighborhoods.includes("Centro") &&
    availableNeighborhoods.includes("Zona Sul") &&
    availableNeighborhoods.includes("Zona Norte");

  const handleManualAdd = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && manualInput.trim()) {
      e.preventDefault();
      const neighborhood = manualInput.trim();
      if (!selectedNeighborhoods.includes(neighborhood)) {
        onNeighborhoodChange(neighborhood);
      }
      setManualInput("");
    }
  };

  const handleRemoveManual = (neighborhood: string) => {
    onNeighborhoodChange(neighborhood);
  };

  return (
    <Card className="border-primary/30 animate-in fade-in-50 duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Onde você atende?
            </CardTitle>
            <CardDescription>
              {isGenericFallback
                ? "Digite os bairros onde você atende e pressione Enter"
                : "Selecione os bairros para aumentar sua visibilidade"}
            </CardDescription>
          </div>
          {selectedNeighborhoods.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedNeighborhoods.length} selecionado{selectedNeighborhoods.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isGenericFallback ? (
          <div className="space-y-4">
            <Input
              placeholder="Digite um bairro e pressione Enter"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={handleManualAdd}
              className="w-full"
            />
            {selectedNeighborhoods.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedNeighborhoods.map((neighborhood) => (
                  <Badge
                    key={neighborhood}
                    variant="secondary"
                    className="px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-destructive/20"
                    onClick={() => handleRemoveManual(neighborhood)}
                  >
                    {neighborhood}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              💡 Digite cada bairro e pressione Enter para adicionar. Clique para remover.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableNeighborhoods.map((neighborhood) => (
              <PillButton
                key={neighborhood}
                selected={selectedNeighborhoods.includes(neighborhood)}
                onClick={() => onNeighborhoodChange(neighborhood)}
              >
                {neighborhood}
              </PillButton>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
