import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  HeartIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../ui/cn";

const NAV_ITEMS = [
  { to: "/home", label: "Home", icon: HomeIcon },
  { to: "/discover", label: "Discover", icon: MagnifyingGlassIcon },
  { to: "/communities", label: "Communities", icon: UserGroupIcon },
  { to: "/matches", label: "Matches", icon: HeartIcon },
  { to: "/creators", label: "Creators", icon: PencilSquareIcon },
  { to: "/chat", label: "Chat", icon: ChatBubbleLeftRightIcon },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

export default function Sidebar({ isExpanded, toggleSidebar }) {
  const location = useLocation();

  return (
    <nav className="h-full bg-surface border-r border-ink/10 flex flex-col py-4">
      <ul className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, comingSoon }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={comingSoon ? "#" : to}
                aria-disabled={comingSoon}
                onClick={(e) => comingSoon && e.preventDefault()}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent/15 text-accent-dark"
                    : "text-ink-muted hover:bg-surface-raised hover:text-ink",
                  comingSoon && "opacity-50 cursor-default hover:bg-transparent"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                {isExpanded && (
                  <span className="truncate">
                    {label}
                    {comingSoon && <span className="ml-1 text-xs">(soon)</span>}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        onClick={toggleSidebar}
        className="mx-2 px-3 py-2 rounded-lg text-ink-muted hover:bg-surface-raised hover:text-ink text-sm text-left"
      >
        {isExpanded ? "Collapse" : "»"}
      </button>
    </nav>
  );
}
