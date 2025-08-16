import MCQ from "@/components/MCQ";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import React from "react";

// Next.js automatically injects `params` for dynamic routes.
// No need to define a conflicting `Props` type.
interface PageProps {
  params: {
    gameId: string;
  };
}

// This is a Server Component.
const MCQPage = async ({ params }: PageProps) => {
  const { gameId } = params;

  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
      userId: session.user.id, // Ensure ownership
    },
    include: {
      questions: {
        select: {
          id: true,
          question: true,
          options: true,
        },
      },
    },
  });

  if (!game || game.gameType !== "mcq") {
    redirect("/quiz");
  }

  return <MCQ game={game} />;
};

export default MCQPage;
