import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button, type ButtonProps } from "../Button";

export const GithubLinkButton: React.FC<
  {
    href: string;
  } & ButtonProps
> = ({ href, ...props }) => {
  return (
    <Button variant={"secondary"} {...props} asChild>
      <a href={href} target="_blank" rel="noreferrer">
        <GitHubLogoIcon className="mr-2 h-4 w-4" />
        View on GitHub
      </a>
    </Button>
  );
};
