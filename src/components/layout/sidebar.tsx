"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  LayoutDashboard,
  ShoppingBag,
  LineChart,
  BookmarkCheck,
  Bell,
  Settings,
  TrendingUp,
  Clock,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/dashboard", label: "Dashboard", icon: TrendingUp },
  { href: "/watchlist", label: "Watchlist", icon: BookmarkCheck },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r bg-background/95 backdrop-blur-xl md:flex">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <span>PriceScraper</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-xs font-medium">3 alerts active</span>
            <span className="text-xs text-muted-foreground">2 price drops</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
