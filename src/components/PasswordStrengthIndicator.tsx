import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const requirements = [
    { label: "Mínimo de 8 caracteres", test: password.length >= 8 },
    { label: "Pelo menos uma letra maiúscula", test: /[A-Z]/.test(password) },
    { label: "Pelo menos uma letra minúscula", test: /[a-z]/.test(password) },
    { label: "Pelo menos um número", test: /[0-9]/.test(password) },
    { label: "Pelo menos um caractere especial", test: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const strength = requirements.filter(req => req.test).length;
  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strength <= 2) return "Fraca";
    if (strength <= 3) return "Média";
    if (strength <= 4) return "Boa";
    return "Forte";
  };

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Força da senha:</span>
          <span className="font-medium">{getStrengthLabel()}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${getStrengthColor()}`}
            style={{ width: `${(strength / requirements.length) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {req.test ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={req.test ? "text-foreground" : "text-muted-foreground"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};