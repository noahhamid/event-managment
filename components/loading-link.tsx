"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingLinkProps {
  href: string;
  children: ReactNode;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg";
}

export function LoadingLink({
  href,
  children,
  variant = "ghost",
  size = "sm",
}: LoadingLinkProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <Button variant={variant} size={size} asChild onClick={handleClick}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
