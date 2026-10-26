"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import AddListingModal from "@/components/landlord/AddListingModal";

interface AddListingButtonProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export default function AddListingButton({
  variant = "primary",
  size = "md",
  className,
  label = "Add Residence",
}: AddListingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
        {label}
      </Button>

      <AddListingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
