"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname();

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 sm:bottom-auto left-1/2 -translate-x-1/2 z-50 mb-6 sm:mb-0 sm:mt-6 pointer-events-none",
        className
      )}
    >
      <div className="flex items-center gap-1 bg-white/80 border border-stone-200 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg shadow-black/5 pointer-events-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);

          return (
            <Link
              key={item.name}
              href={item.url}
              // En mobile solo se ve el ícono: `hidden` es display:none y saca el
              // texto del árbol de accesibilidad, dejando el link sin nombre.
              aria-label={item.name}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-stone-600 hover:text-primary",
                active && "text-primary"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden" aria-hidden="true">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {active && (
                <motion.div
                  layoutId="lamp"
                  aria-hidden="true"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
