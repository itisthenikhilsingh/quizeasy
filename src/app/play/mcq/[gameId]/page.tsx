import MCQ from "@/components/MCQ";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import React from "react";

// No custom PageProps to avoid type conflicts
const MCQPage = async ({
  params,
}: {
  params: { gameId: string };
}) => {
  const { gameId } = params;

  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
      userId: session.user.id, // ensure ownership
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
