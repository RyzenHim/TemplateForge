import ProtectedRoute from "../(auth)/protectedRoute/ProtectedRoute";
import Sidebar from "../components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      {/* <Sidebar /> */}
      <ProtectedRoute>{children}</ProtectedRoute>
    </div>
  );
}
