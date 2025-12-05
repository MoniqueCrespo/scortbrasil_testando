import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  title: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export const ProgressSteps = ({ steps, currentStep, completedSteps }: ProgressStepsProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  completedSteps.includes(step.number)
                    ? "bg-primary border-primary text-primary-foreground"
                    : currentStep === step.number
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted-foreground/25 text-muted-foreground"
                )}
              >
                {completedSteps.includes(step.number) ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.number}</span>
                )}
              </div>
              <p
                className={cn(
                  "mt-2 text-xs font-medium hidden sm:block",
                  currentStep === step.number ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-all",
                  completedSteps.includes(step.number)
                    ? "bg-primary"
                    : "bg-muted-foreground/25"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
