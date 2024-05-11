import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

export const SubLinks: React.FC<{
  navItem: NavItem;
}> = ({ navItem }) => (
  <ul className="grid gap-3 p-4 grid-cols-1 lg:w-[300px] ">
    {navItem.subLinks?.map((subLink) => (
      <li key={subLink.href}>
        <a
          href={subLink.href}
          className={cn(
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
          )}
        >
          <div className="flex flex-col text-sm font-medium leading-none gap-2">
            <span>{subLink.title}</span>
            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
              {subLink.description}
            </p>
          </div>
        </a>
      </li>
    ))}
  </ul>
);
