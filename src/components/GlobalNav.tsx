"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/today", label: "Today" },
  { href: "/projects", label: "Projects" },
  { href: "/history", label: "History" },
];

export function GlobalNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 flex items-center gap-6 h-12">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 mr-2">
          Dev OS
        </span>
        {links.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                active
                  ? "text-gray-900 dark:text-gray-100 font-medium"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
