import { ButtonHTMLAttributes, forwardRef } from "react";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50";

const VARIANTS = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  ghost: "hover:bg-muted",
  outline: "border hover:bg-muted",
  destructive:
    "border hover:bg-destructive/10 text-destructive",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  icon: "p-2",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      fullWidth,
      children,
      ...props
    },
    ref
  ) => {
    const classes = [
      BASE,
      VARIANTS[variant],
      SIZES[size],
      fullWidth && "w-full",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
