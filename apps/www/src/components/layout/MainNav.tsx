import { cn, extractSegmentURL } from "@/lib/utils";
import type { MainNavItem } from "@/types";
import { MainNavSubLinks } from "../MainNavSubLinks";
import { NavigationMenu, NavigationMenuList } from "../ui/NavigationMenu";

type Props = {
  items: MainNavItem[];
  pathname: string;
};

export const MainNav: React.FC<Props> = ({ items, pathname }) => {
  const segment = extractSegmentURL(pathname);

  return items?.length ? (
    <NavigationMenu>
      <NavigationMenuList className="hidden gap-6 md:flex">
        {items?.map((item) => {
          const titleClass = cn(
            "hover:text-foreground/80 flex items-center text-lg font-medium sm:text-sm",
            item.href?.startsWith(`/${segment}`)
              ? "text-foreground"
              : "text-foreground/60",
            item.disabled && "cursor-not-allowed opacity-80",
          );
          if (item.subLinks) {
            return (
              <MainNavSubLinks
                key={item.title}
                navItem={item}
                titleClass={titleClass}
              />
            );
          }
          return (
            <a
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={titleClass}
            >
              {item.title}
            </a>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  ) : null;
};
