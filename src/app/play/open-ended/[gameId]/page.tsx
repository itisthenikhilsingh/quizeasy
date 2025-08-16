import OpenEnded from "@/components/OpenEnded";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import React from "react";

// Correct type for Next.js dynamic route
interface PageProps {
  params: {
    gameId: string;
  };
}

const OpenEndedPage = async ({ params: { gameId } }: PageProps) => {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
      userId: session.user.id, // 🔒 ensure only the owner can access
    },
    include: {
      questions: {
        select: {
          id: true,
          question: true,
          answer: true,
        },
      },
    },
  });

  // ✅ Ensure it's not MCQ (must be open-ended)
  if (!game || game.gameType !== "open_ended") {
    redirect("/quiz");
  }

  return <OpenEnded game={game} />;
};

export default OpenEndedPage;
