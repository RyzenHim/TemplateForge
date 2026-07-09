import Sidebar from "@/app/components/layout/Sidebar";
import Link from "next/link";
import { appItems } from "@/app/lib/navigation/navigations";
export default function AppsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <Sidebar menuOptions={appItems} />
      {children}
    </div>
  );
}
