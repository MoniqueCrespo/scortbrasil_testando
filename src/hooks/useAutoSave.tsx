import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  key: string;
  data: any;
  interval?: number; // milliseconds
  enabled?: boolean;
}

export const useAutoSave = ({ key, data, interval = 30000, enabled = true }: UseAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const saveData = () => {
      const serialized = JSON.stringify(data);
      
      // Only save if data has changed
      if (serialized !== lastSavedRef.current) {
        setIsSaving(true);
        localStorage.setItem(key, serialized);
        lastSavedRef.current = serialized;
        
        setTimeout(() => {
          setIsSaving(false);
          toast.success('Progresso salvo automaticamente', {
            duration: 2000,
            position: 'bottom-right',
          });
        }, 500);
      }
    };

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(saveData, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, key, interval, enabled]);

  const loadSavedData = (): any | null => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading saved data:', error);
      return null;
    }
  };

  const clearSavedData = () => {
    localStorage.removeItem(key);
    lastSavedRef.current = '';
  };

  return {
    loadSavedData,
    clearSavedData,
    isSaving,
  };
};
