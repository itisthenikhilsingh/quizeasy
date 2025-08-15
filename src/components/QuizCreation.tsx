"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { quizCreationSchema } from "@/schemas/form/quiz";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import LoadingQuestions from "./LoadingQuestions";

type Input = z.infer<typeof quizCreationSchema>;

const QuizCreation = () => {
  const router = useRouter();
  const [finished, setFinished] = React.useState(false);
  const [showLoader, setShowLoader] = React.useState(false);

  const { mutate: getQuestions, isPending } = useMutation({
    mutationFn: async ({ amount, topic, type }: Input) => {
      const response = await axios.post("/api/game", {
        amount,
        topic,
        type,
      });
      return response.data;
    },
  });

  const form = useForm<Input>({
    resolver: zodResolver(quizCreationSchema),
    defaultValues: {
      amount: 3,
      topic: "",
      type: "open-ended",
    },
  });

  function onSubmit(input: Input) {
    setShowLoader(true); // start loader
    getQuestions(input, {
      onSuccess: ({ gameId }) => {
        setFinished(true);
        setTimeout(() => {
          if (form.getValues("type") === "mcq") {
            router.push(`/play/mcq/${gameId}`);
          } else {
            router.push(`/play/open-ended/${gameId}`);
          }
        }, 2000); // show loader for 2s
      },
      onError: () => {
        setShowLoader(false); // stop loader if error happens
      },
    });
  }

  form.watch();

  if (showLoader) {
    return <LoadingQuestions finished={finished} />;
  }

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card className="w-96 p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="font-bold text-2xl mb-2">
            Quiz Creation
          </CardTitle>
          <CardDescription className="text-base">
            Enter The Topic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the Topic" {...field} />
                    </FormControl>
                    <FormDescription>
                      Please enter the topic for your quiz.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of the Question</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the Number of the question"
                        {...field}
                        type="number"
                        min={3}
                        max={10}
                        onChange={(e) => {
                          form.setValue("amount", parseInt(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Please enter the number of questions you want in your
                      quiz.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            value="open-ended"
                            checked={field.value === "open-ended"}
                            onChange={() => field.onChange("open-ended")}
                          />
                          Open Ended
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            value="mcq"
                            checked={field.value === "mcq"}
                            onChange={() => field.onChange("mcq")}
                          />
                          Multiple Choice
                        </label>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Choose the type of questions for your quiz.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isPending} type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizCreation;
