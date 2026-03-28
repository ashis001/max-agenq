"use client";

import { usePathname } from "next/navigation";
import Agent from "./Agent";

export default function AgentProvider() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return <Agent />;
}
