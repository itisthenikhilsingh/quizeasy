import { prisma } from "@/lib/db";
import { checkAnswerSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import stringSimilarity from "string-similarity";

// The API handler in Next.js App Router receives only one argument: the request object.
// The `res: Response` parameter has been removed to fix the compilation error.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questionId, userInput } = checkAnswerSchema.parse(body);

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        {
          error: "Question not found",
        },
        {
          status: 404,
        }
      );
    }

    // Handle MCQ questions
    if (question.questionType === "mcq") {
      const isCorrect =
        question.answer.toLowerCase().trim() === userInput.toLowerCase().trim();

      // Combine database updates into a single, more efficient call.
      await prisma.question.update({
        where: { id: questionId },
        data: {
          userAnswer: userInput,
          isCorrect,
        },
      });

      return NextResponse.json({
        isCorrect,
      });
    } 
    // Handle Open-Ended questions
    else if (question.questionType === "open_ended") {
      let percentageSimilar = stringSimilarity.compareTwoStrings(
        question.answer.toLowerCase().trim(),
        userInput.toLowerCase().trim()
      );
      percentageSimilar = Math.round(percentageSimilar * 100);

      // Combine database updates into a single call here as well.
      await prisma.question.update({
        where: { id: questionId },
        data: {
          userAnswer: userInput,
          percentageCorrect: percentageSimilar,
        },
      });

      return NextResponse.json({
        percentageSimilar,
      });
    }

    // Added a fallback case: If the question type is invalid, the original code
    // would exit without a response, causing the request to time out.
    return NextResponse.json(
      {
        error: "Invalid question type",
      },
      { status: 400 }
    );

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues,
        },
        {
          status: 400, // Bad Request for validation errors
        }
      );
    }
    
    // Added a generic error handler for all other potential errors (e.g., database issues).
    // This is crucial for production to prevent the server from crashing or timing out.
    console.error("Error in /api/checkAnswer:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred.",
      },
      {
        status: 500, // Internal Server Error
      }
    );
  }
}
