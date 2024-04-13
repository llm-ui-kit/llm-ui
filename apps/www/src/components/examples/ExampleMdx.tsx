import { cn } from "@/lib/utils";
import {
  ExampleSideBySide as ExampleSideBySideOriginal,
  ExampleTabs as ExampleTabsOriginal,
  type ExampleProps,
  type ExampleSideBySideProps,
} from "./Example";

const defaultBackgroundClassName = "bg-background-200";
const defaultClassName = "my-8";

export const ExampleSideBySide: React.FC<ExampleSideBySideProps> = ({
  backgroundClassName = defaultBackgroundClassName,
  className,
  tabs = ["raw", "llm-ui"],
  ...props
}) => (
  <ExampleSideBySideOriginal
    className={cn(defaultClassName, className)}
    backgroundClassName={backgroundClassName}
    tabs={tabs}
    {...props}
  />
);

export const ExampleTabs: React.FC<ExampleProps> = ({
  backgroundClassName = defaultBackgroundClassName,
  className,
  tabs = ["raw", "llm-ui"],
  ...props
}) => (
  <ExampleTabsOriginal
    className={cn(defaultClassName, className)}
    backgroundClassName={backgroundClassName}
    tabs={tabs}
    {...props}
  />
);
