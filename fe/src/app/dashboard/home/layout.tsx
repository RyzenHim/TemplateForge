import Sidebar from "@/app/components/layout/Sidebar";
import { homeItems } from "@/app/lib/navigation/navigations";

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex">
      <Sidebar menuOptions={homeItems} />

      {children}
    </div>
  );
}
