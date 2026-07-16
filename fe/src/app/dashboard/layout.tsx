import ProtectedRoute from "../(auth)/protectedRoute/ProtectedRoute";
// import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex">
      <Sidebar />
      {/* <Navbar /> */}
      <ProtectedRoute>{children}</ProtectedRoute>
    </div>
  );
}
