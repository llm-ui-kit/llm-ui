import { cn } from "@/lib/utils";
import type { UseStreamWithProbabilitiesOptions } from "@llm-ui/react";
import {
  ExampleSideBySide as ExampleSideBySideOriginal,
  ExampleTabs as ExampleTabsOriginal,
  type ExampleProps,
  type ExampleSideBySideProps,
} from "./Example";

const defaultBackgroundClassName = "bg-background-200 border-background";
const defaultClassName = "my-8";

const defaultOptions: Partial<UseStreamWithProbabilitiesOptions> = {
  autoStart: false,
};

export const ExampleSideBySide: React.FC<ExampleSideBySideProps> = ({
  backgroundClassName = defaultBackgroundClassName,
  className,
  showPlayPause = true,
  tabs = ["raw", "llm-ui"],
  ...props
}) => {
  const options = { ...defaultOptions, ...props.options };
  return (
    <ExampleSideBySideOriginal
      className={cn(defaultClassName, className)}
      options={options}
      backgroundClassName={backgroundClassName}
      tabs={tabs}
      showPlayPause={showPlayPause}
      loop={false}
      {...props}
    />
  );
};

export const ExampleTabs: React.FC<ExampleProps> = ({
  backgroundClassName = defaultBackgroundClassName,
  className,
  showPlayPause = true,

  tabs = ["raw", "llm-ui"],
  ...props
}) => {
  const options = { ...defaultOptions, ...props.options };
  return (
    <ExampleTabsOriginal
      className={cn(defaultClassName, className)}
      options={options}
      backgroundClassName={backgroundClassName}
      tabs={tabs}
      showPlayPause={showPlayPause}
      loop={false}
      {...props}
    />
  );
};
