import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { quizCreationSchema } from "@/schemas/form/quiz";
import { NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a game." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { topic, type, amount } = quizCreationSchema.parse(body);

    // Map incoming type to Prisma enum
    const prismaGameType = type === "open-ended" ? "open_ended" : "mcq";

    // Create the game record
    const game = await prisma.game.create({
      data: {
        gameType: prismaGameType as any,
        timeStarted: new Date(),
        userId: session.user.id,
        topic,
      },
    });

    // Update topic_count table
    await prisma.topic_count.upsert({
      where: { topic },
      create: { topic, count: 1 },
      update: { count: { increment: 1 } },
    });

    // Get questions from your external API
    const { data } = await axios.post(
      `${process.env.API_URL as string}/api/questions`,
      { amount, topic, type }
    );

    // Save questions depending on type
    if (prismaGameType === "mcq") {
      type mcqQuestion = {
        question: string;
        answer: string;
        option1: string;
        option2: string;
        option3: string;
      };

      const manyData = data.questions.map((q: mcqQuestion) => {
        const options = [q.option1, q.option2, q.option3, q.answer].sort(
          () => Math.random() - 0.5
        );

        return {
          question: q.question,
          answer: q.answer,
          options: JSON.stringify(options),
          gameId: game.id,
          questionType: "mcq" as const,
        };
      });

      await prisma.question.createMany({ data: manyData });
    } else {
      type openQuestion = { question: string; answer: string };

      await prisma.question.createMany({
        data: data.questions.map((q: openQuestion) => ({
          question: q.question,
          answer: q.answer,
          gameId: game.id,
          questionType: "open_ended" as const,
        })),
      });
    }

    return NextResponse.json({ gameId: game.id }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating game:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to view a game." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const gameId = url.searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json(
        { error: "You must provide a game id." },
        { status: 400 }
      );
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { questions: true },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    return NextResponse.json({ game }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
