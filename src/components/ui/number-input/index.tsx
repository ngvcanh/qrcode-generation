import { forwardRef, KeyboardEvent } from "react";
import { TextInput, TextInputProps } from "../text-input";

export type NumberInputProps = Omit<TextInputProps, "type">;

const AllowedKeys = [
  "Backspace",
  "Delete",
  "ArrowLeft",
  "ArrowRight",
  "Tab",
  "Enter",
  "Escape",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  ".",
  "0", "1", "2", "3", "4", "5",
  "6", "7", "8", "9",
  "-",
  "+",
  "NumLock",
  "Numpad0", "Numpad1", "Numpad2",
  "Numpad3", "Numpad4", "Numpad5",
  "Numpad6", "Numpad7", "Numpad8",
  "Numpad9", "NumpadDecimal",
  "NumpadAdd", "NumpadSubtract",
  "NumpadMultiply", "NumpadDivide"
];

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(props, ref) {
    const { onKeyDown, ...rest } = props;

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (!AllowedKeys.includes(e.key)) {
        e.preventDefault();
        return;
      }

      onKeyDown?.(e);
    };

    return (
      <TextInput
        {...rest}
        ref={ref}
        type="text"
        onKeyDown={handleKeyDown}
      />
    );
  }
);