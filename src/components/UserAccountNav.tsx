"use client";
import React from "react";
import { User } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import UserAvatar from "./UserAvatar";

type Props = {
  user: Pick<User, "name" | "image" | "email">;
};

const UserAccountNav = ({ user }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {/* the avatar*/}
        <UserAvatar
          user={{
            image: user.image ?? null,
            name: user.name ?? null,
            email: user.email ?? null,
          }}
        ></UserAvatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-white dark:bg-gray-950 w-60"
        align="end"
      >
        <div className="flex items-center justify-start gap-2 p-2 ">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name} </p>}
            {user.email && (
              <p className="text-sm w-[200px] truncate text-zinc-700 ">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">ITema 1</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            signOut().catch(console.error);
          }}
        >
          Sign Out
          <LogOut className="ml-auto h-4 w-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
