import { cn } from "@/lib/utils";
import type React from "react";
import { useState } from "react";
import { Button, type ButtonProps } from "../Button";

type ButtonGroupProps = {
  className?: string;
  buttons: {
    text: string;
    props?: ButtonProps;
  }[];
  defaultActiveIndex?: number;
  tabIndex?: number;
  onIndexChange?: (index: number) => void;
};

export const ButtonToggleGroup: React.FC<ButtonGroupProps> = ({
  className,
  buttons,
  onIndexChange = () => null,
  tabIndex,
  defaultActiveIndex = 0,
}) => {
  const [activeIndexInternal, setActiveIndexInternal] =
    useState(defaultActiveIndex);
  const activeIndex = tabIndex ?? activeIndexInternal;
  return (
    <div className={cn("flex flex-row", className)}>
      {buttons.map(({ text, props = {} }, index) => (
        <Button
          key={index}
          variant={"tab"}
          size={"xs"}
          data-state={activeIndex === index ? "active" : "inactive"}
          className={cn("rounded-sm bg-transparent text-foreground")}
          {...props}
          onClick={(event) => {
            setActiveIndexInternal(index);
            onIndexChange(index);
            if (props.onClick) props.onClick(event);
          }}
        >
          {text}
        </Button>
      ))}
    </div>
  );
};
