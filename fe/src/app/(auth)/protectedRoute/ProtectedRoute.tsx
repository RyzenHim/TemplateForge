"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/app/components/ui/Loader";
import { useProfile } from "@/app/lib/hooks/auth/useProfile";
import { logout } from "@/app/lib/services/auth.service";
interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  console.log("ProtectedRoute rendered");
  const router = useRouter();

  const { data, isLoading, isError } = useProfile();
  useEffect(() => {
    // const token = localStorage.getItem("token");
    if (isError) {
      logout();
      router.replace("/login");
      return;
    }
  }, [router, isError]);
  if (isLoading) {
    return <Loader text="Checking Authentication..." />;
  }
  if (isError) {
    return null;
  }
  return <>{children}</>;
}
