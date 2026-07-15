import Sidebar from "@/app/components/layout/Sidebar";
import Link from "next/link";
export default function templateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex">{children}</div>;
}
