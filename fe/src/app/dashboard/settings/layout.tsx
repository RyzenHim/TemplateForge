import Sidebar from "@/app/components/layout/Sidebar";
import Link from "next/link";
export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex">{children}</div>;
}
