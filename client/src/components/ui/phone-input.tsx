import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import {
  formatPhone,
  getPhoneError,
  getPhoneType,
  unformatPhone,
} from "@/lib/phone-formatter";
import { cn } from "@/lib/utils";

interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  showType?: boolean;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    { value = "", onChange, error, showType = false, className, ...props },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatPhone(inputValue);

      // Só permite mudanças se não exceder 15 caracteres (formato completo)
      if (formatted.length <= 16) {
        onChange?.(formatted);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permite apenas números, backspace, delete, tab, escape, enter e teclas de navegação
      if (
        ![8, 9, 27, 13, 46, 110, 190].includes(e.keyCode) &&
        // Permite Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode < 65 || e.keyCode > 90 || !e.ctrlKey) &&
        // Permite teclas de navegação
        (e.keyCode < 35 || e.keyCode > 39) &&
        // Não permite se não for número
        (e.keyCode < 48 || e.keyCode > 57) &&
        (e.keyCode < 96 || e.keyCode > 105)
      ) {
        e.preventDefault();
      }
    };

    const phoneType = getPhoneType(value);
    const phoneError = getPhoneError(value);
    const displayError = error || phoneError;

    return (
      <div className="space-y-1">
        <Input
          ref={ref}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="(45) 9 9999-9999"
          className={cn(
            className,
            displayError &&
              "border-red-500 focus:border-red-500 focus:ring-red-500",
          )}
          {...props}
        />
        {showType && value && phoneType !== "invalid" && (
          <div className="text-xs text-gray-500">
            {phoneType === "mobile" ? "Celular" : "Telefone fixo"}
          </div>
        )}
        {displayError && (
          <div className="text-xs text-red-500">{displayError}</div>
        )}
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
