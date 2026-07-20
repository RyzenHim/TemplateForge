import ProtectedRoute from "../(auth)/protectedRoute/ProtectedRoute";
// import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="ml-72 min-h-screen overflow-y-auto overflow-x-hidden">
        <ProtectedRoute>{children}</ProtectedRoute>
      </main>
    </div>
  );
}
