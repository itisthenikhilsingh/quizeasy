import { User } from "@/generated/prisma";
import Image from "next/image";
import React from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";

type Props = {
  user: Pick<User, "name" | "image" | "email">;
};

const UserAvatar = ({ user }: Props) => {
  return (
    <Avatar>
      {user.image ? (
        <div className="relative w-full aspect-square">
          <Image
            fill
            src={user.image}
            alt="profile picture"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className="sr-only ">{user.name}</span>
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
