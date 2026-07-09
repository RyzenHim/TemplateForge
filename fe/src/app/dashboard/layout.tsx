import Sidebar from "../components/layout/Sidebar";

export default function DashbaordLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      {/* <Sidebar /> */}

      {children}
    </div>
  );
}
