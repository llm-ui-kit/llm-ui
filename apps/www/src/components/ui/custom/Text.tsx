import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as React from "react";

// Source: https://github.com/shadcn-ui/ui/pull/363#issuecomment-1659259897

const typographyVariants = cva("text-foreground font-sans", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-normal tracking-tight lg:text-5xl font-serif",
      h2: "scroll-m-20 text-3xl font-medium tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-medium tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      h5: "scroll-m-20 text-lg font-semibold tracking-tight",
      h6: "scroll-m-20 text-base font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      ul: "my-6 ml-6 list-disc [&>li]:mt-2",
      inlineCode:
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      lead: "text-xl text-muted-foreground",
      largeText: "text-lg font-semibold",
      smallText: "text-sm font-medium leading-none",
      mutedText: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

type VariantPropType = VariantProps<typeof typographyVariants>;

const variantElementMap: Record<
  NonNullable<VariantPropType["variant"]>,
  string
> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  p: "p",
  blockquote: "blockquote",
  inlineCode: "code",
  largeText: "div",
  smallText: "small",
  lead: "p",
  mutedText: "p",
  ul: "ul",
};

export type TypographyProps = {
  asChild?: boolean;
  as?: string;
} & React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants>;

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, asChild, ...props }, ref) => {
    const Comp = asChild
      ? Slot
      : as ?? (variant ? variantElementMap[variant] : undefined) ?? "div";
    return (
      <Comp
        className={cn(typographyVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Typography.displayName = "Typography";

type TypographyTag = Omit<TypographyProps, "as">;

const H1 = React.forwardRef<HTMLElement, TypographyTag>((props, ref) => (
  <Typography ref={ref} variant="h1" {...props} />
));
H1.displayName = "H1";

const H2 = React.forwardRef<HTMLElement, TypographyTag>((props, ref) => (
  <Typography ref={ref} variant="h2" {...props} />
));
H2.displayName = "H2";

const H3 = React.forwardRef<HTMLElement, TypographyTag>((props, ref) => (
  <Typography ref={ref} variant="h3" {...props} />
));
H3.displayName = "H4";

const H4 = React.forwardRef<HTMLElement, TypographyTag>((props, ref) => (
  <Typography ref={ref} variant="h4" {...props} />
));
H4.displayName = "H4";

const H5 = React.forwardRef<HTMLElement, TypographyTag>((props, ref) => (
  <Typography ref={ref} variant="h5" {...props} />
));
H5.displayName = "H5";

const H6 = React.forwardRef<HTMLElement, TypographyTag>((props, ref) => (
  <Typography ref={ref} variant="h6" {...props} />
));
H6.displayName = "H6";

export {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Typography as Text,
  Typography,
  typographyVariants,
};
