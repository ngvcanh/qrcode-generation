import { cn } from "@/lib/cn";
import { ChangeEvent, DetailedHTMLProps, forwardRef, InputHTMLAttributes, ReactNode, useEffect, useState } from "react";

type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export interface TextInputProps extends InputProps {
  label?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(props, ref) {
    const { className, label, autoComplete = "off", value = "", onChange, ...rest } = props;

    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
      value === currentValue || setCurrentValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.target.value;
      setCurrentValue(nextValue);
      onChange?.(e);
    }

    return (
      <div className={cn("w-full", className)}>
        {!!label && (
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            {...rest}
            ref={ref}
            type="text"
            className={cn(
              "w-full px-4 py-4 text-base rounded-xl border-2 transition-all duration-200",
              "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100",
              "border-slate-200 dark:border-slate-600",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400",
              "hover:border-slate-300 dark:hover:border-slate-500",
              "shadow-sm hover:shadow-md focus:shadow-lg",
              "disabled:bg-slate-50 dark:disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
            )}
            value={currentValue}
            onChange={handleChange}
            autoComplete={autoComplete}
          />
          
          {/* Focus ring effect */}
          <div className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-200 opacity-0 focus-within:opacity-100">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
          </div>
        </div>
      </div>
    );
  }
);