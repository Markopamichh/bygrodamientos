"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

const animationProps: React.ComponentProps<typeof motion.button> = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
};

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
}

export const ShinyButton: React.FC<ShinyButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <motion.button
      {...animationProps}
      {...props}
      className={cn(
        "relative rounded-lg bg-primary px-6 py-2 font-medium backdrop-blur-xl transition-all duration-300 ease-in-out hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30",
        className
      )}
    >
      <span
        className="relative block size-full text-sm uppercase tracking-wide text-white"
        style={{
          maskImage:
            "linear-gradient(-75deg,#fff calc(var(--x) + 20%),transparent calc(var(--x) + 30%),#fff calc(var(--x) + 100%))",
        }}
      >
        {children}
      </span>
      <span
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          maskComposite: "exclude",
        }}
        className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,rgba(255,255,255,0.15)_calc(var(--x)+20%),rgba(255,255,255,0.6)_calc(var(--x)+25%),rgba(255,255,255,0.15)_calc(var(--x)+100%))] p-px"
      ></span>
    </motion.button>
  );
};
