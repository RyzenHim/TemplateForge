"use client";

import Sidebar from "@/app/components/layout/Sidebar";

export default function EditLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
