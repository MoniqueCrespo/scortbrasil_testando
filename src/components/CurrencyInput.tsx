import { NumericFormat } from 'react-number-format';
import { Input } from '@/components/ui/input';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CurrencyInput = ({ value, onChange, placeholder, className }: CurrencyInputProps) => {
  return (
    <NumericFormat
      customInput={Input}
      value={value}
      onValueChange={(values) => onChange(values.value)}
      thousandSeparator="."
      decimalSeparator=","
      prefix="R$ "
      decimalScale={2}
      fixedDecimalScale
      placeholder={placeholder || "R$ 0,00"}
      className={className}
    />
  );
};
