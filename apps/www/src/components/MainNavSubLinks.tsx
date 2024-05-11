import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@/components/ui/NavigationMenu";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";
import { SubLinks } from "./SubLinks";

export const MainNavSubLinks: React.FC<{
  navItem: NavItem;
  titleClass: string;
}> = ({ navItem, titleClass }) => (
  <NavigationMenuItem>
    <NavigationMenuTrigger className={cn(titleClass, "-mx-4")}>
      {navItem.title}
    </NavigationMenuTrigger>
    <NavigationMenuContent>
      <SubLinks navItem={navItem} />
    </NavigationMenuContent>
  </NavigationMenuItem>
);
