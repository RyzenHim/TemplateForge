import Sidebar from "@/app/components/layout/Sidebar";
import Link from "next/link";
import { templateItems } from "@/app/lib/navigation/navigations";
export default function templateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <Sidebar menuOptions={templateItems} />
      {children}
    </div>
  );
}
