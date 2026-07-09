import Sidebar from "@/app/components/layout/Sidebar";
import Link from "next/link";
import { SettingItems } from "@/app/lib/navigation/navigations";
export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <Sidebar menuOptions={SettingItems} />
      {children}
    </div>
  );
}
