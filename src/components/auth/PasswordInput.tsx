"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import Input from "@/components/ui/Input";

type PasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "icon" | "endAdornment"
>;

export default function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Input
      {...props}
      type={isVisible ? "text" : "password"}
      icon={<Lock className="h-4 w-4" aria-hidden="true" />}
      endAdornment={
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      }
    />
  );
}
