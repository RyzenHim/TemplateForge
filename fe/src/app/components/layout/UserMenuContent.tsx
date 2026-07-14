"use client";

import { logout } from "@/app/lib/services/auth.service";
import { showApiSuccess } from "@/app/lib/utils";
import { useRouter } from "next/navigation";

export default function UserMenuContent() {
  const router = useRouter();
  const userMenus = [
    { label: "My Apps", href: "/dashbaord/apps" },
    { label: "My Profile", href: "/dashboard/profile" },
    { label: "Logout", action: "logout" },
  ];

  function handleMenuClick(menu: (typeof userMenus)[number]) {
    if (menu.action === "logout") {
      logout();
      showApiSuccess("Logout success");
      router.push("/");
      return;
    }
    if (menu.href) {
      router.push(menu.href);
    }
  }
  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
      <ul className="py-2">
        {userMenus.map((menu, i) => (
          <li
            onClick={() => handleMenuClick(menu)}
            key={i}
            className="cursor-pointer px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
          >
            {menu.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
