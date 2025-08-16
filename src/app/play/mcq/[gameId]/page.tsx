import MCQ from "@/components/MCQ";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import React from "react";

// Props for a dynamic route page in Next.js App Router.
// The `params` object contains the route parameters.
type Props = {
  params: {
    gameId: string;
  };
};

// This is a Server Component, so it can be an async function.
const MCQPage = async ({ params }: Props) => {
  // The `params` object is passed directly, not as a promise.
  // The `await` keyword has been removed to fix the type error.
  const { gameId } = params;

  const session = await getAuthSession();
  if (!session?.user) {
    // Redirect to the home page if the user is not authenticated.
    return redirect("/");
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
      // It's good practice to also ensure the user owns the game they are trying to play.
      userId: session.user.id,
    },
    include: {
      questions: {
        // Selecting only the necessary fields is more efficient and secure.
        select: {
          id: true,
          question: true,
          options: true,
        },
      },
    },
  });

  // If the game doesn't exist or is not an MCQ game, redirect the user.
  if (!game || game.gameType !== "mcq") {
    return redirect("/quiz");
  }

  // Pass the fetched game data to the client component.
  return <MCQ game={game} />;
};

export default MCQPage;
