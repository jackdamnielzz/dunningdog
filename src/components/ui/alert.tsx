import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "rounded-md border px-3 py-2 text-sm",
  {
    variants: {
      variant: {
        error: "border-red-200 bg-red-50 text-red-700",
        success: "border-accent-200 bg-accent-50 text-accent-800",
        warning: "border-amber-200 bg-amber-50 text-amber-800",
      },
    },
    defaultVariants: {
      variant: "error",
    },
  },
);

interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div className={cn(alertVariants({ variant }), className)} {...props} />
  );
}
