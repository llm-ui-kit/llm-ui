import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button, type ButtonProps } from "../Button";

export const CopyButton: React.FC<
  {
    toCopy?: string;
    text?: string;
  } & ButtonProps
> = ({ className, toCopy, text = "Copy", variant, size, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);

  const Icon = isCopied ? Check : Copy;
  const buttonText = isCopied ? "Copied" : text;

  return (
    <Button
      {...props}
      className={cn(className, isCopied && "opacity-100")}
      size={size ?? "default"}
      variant={variant ?? "default"}
      onClick={() => {
        if (toCopy) {
          navigator.clipboard.writeText(toCopy);
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 1400);
        }
      }}
    >
      <Icon className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
};
