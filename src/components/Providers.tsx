"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";

const Providers = ({ children }: ThemeProviderProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
};

export default Providers;
