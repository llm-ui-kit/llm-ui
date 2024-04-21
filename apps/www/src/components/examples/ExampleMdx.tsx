import { cn } from "@/lib/utils";
import type { UseStreamWithProbabilitiesOptions } from "llm-ui/examples";
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
  loop: false,
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
      backgroundClassName={backgroundClassName}
      tabs={tabs}
      showPlayPause={showPlayPause}
      {...props}
      options={options}
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
      {...props}
    />
  );
};
