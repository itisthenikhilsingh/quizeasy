import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";

type Props = {
  correct_answers: number;
  wrong_answers: number;
};

const MCQCounter = ({ correct_answers, wrong_answers }: Props) => {
  return (
    <Card className="flex flex-row items-center justify-center p-2 w-fit">
      <CheckCircle2 color="green" size={30} />
      <span className="mx-2 text-xl text-[green]">{correct_answers}</span>

      <Separator orientation="vertical" className="h-8 w-px bg-gray-600 mx-2" />

      <span className="mx-2 text-xl text-[red]">{wrong_answers}</span>
      <XCircle color="red" size={30} />
    </Card>
  );
};

export default MCQCounter;
