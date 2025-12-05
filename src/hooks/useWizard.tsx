import { useState } from 'react';

export const useWizard = (totalSteps: number) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const goNext = () => {
    if (currentStep < totalSteps) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const goPrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const markStepComplete = (step: number) => {
    setCompletedSteps(prev => [...new Set([...prev, step])]);
  };

  const isStepCompleted = (step: number) => completedSteps.includes(step);

  return {
    currentStep,
    completedSteps,
    goNext,
    goPrev,
    goToStep,
    markStepComplete,
    isStepCompleted,
  };
};
