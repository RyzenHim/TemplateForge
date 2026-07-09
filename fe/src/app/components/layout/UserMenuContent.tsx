"use client";

export default function UserMenuContent() {
  const userMenus = ["My Apps", "My Profile", "Logout"];

  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
      <ul className="py-2">
        {userMenus.map((menu) => (
          <li
            key={menu}
            className="cursor-pointer px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
          >
            {menu}
          </li>
        ))}
      </ul>
    </div>
  );
}
