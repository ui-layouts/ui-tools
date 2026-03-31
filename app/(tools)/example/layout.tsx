import type { Metadata } from "next";
import type React from "react";

export default function ExampleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
