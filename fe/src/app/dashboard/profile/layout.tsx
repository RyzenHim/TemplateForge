import Sidebar from "@/app/components/layout/Sidebar";
import { profileItems } from "@/app/lib/navigation/navigations";
export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex">
      <Sidebar menuOptions={profileItems} />

      {children}
    </div>
  );
}
