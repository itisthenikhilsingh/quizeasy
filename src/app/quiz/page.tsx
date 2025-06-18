import QuizCreation from "@/components/QuizCreation";
import { getAuthSession } from "@/lib/nextauth";

import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }
  return <QuizCreation></QuizCreation>;
};

export default page;
