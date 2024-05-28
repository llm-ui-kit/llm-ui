import { Button, type ButtonProps } from "../Button";

export const LinkButton: React.FC<
  {
    href: string;
  } & ButtonProps
> = ({ href, children, ...props }) => {
  return (
    <Button {...props} asChild>
      <a href={href}>{children}</a>
    </Button>
  );
};
