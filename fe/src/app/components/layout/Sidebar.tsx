import Link from "next/link";
import Input from "../ui/Input";
import UserMenuDropDown from "./UserMenuDropDown";
import { SidebarProps } from "@/app/lib/types";
export default function Sidebar({ menuOptions }: SidebarProps) {
  return (
    <div className="w-50 border h-screen  p-4">
      <h1 className="font-black">TEMPLATEFORGE</h1>
      <UserMenuDropDown />
      <Input placeholder="Search" />

      <ul className="flex flex-col gap-2 my-2">
        {menuOptions.map((menuOption, i) => (
          <li key={i} className="hover:bg-gray-600 ">
            <Link href={menuOption.href}>{menuOption.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
