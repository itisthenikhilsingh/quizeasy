import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model: string = "gemini-1.5-flash",
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
): Promise<
  {
    question: string;
    answer: string;
  }[]
> {
  const list_input: boolean = Array.isArray(user_prompt);
  const dynamic_elements: boolean = /<.*?>/.test(JSON.stringify(output_format));
  const list_output: boolean = /\[.*?\]/.test(JSON.stringify(output_format));

  let error_msg: string = "";

  for (let i = 0; i < num_tries; i++) {
    let output_format_prompt: string = `\nYou are to output the following in JSON format: ${JSON.stringify(
      output_format
    )}. \nDo not put quotation marks or escape character \\ in the output fields.`;

    if (list_output) {
      output_format_prompt += `\nIf output field is a list, classify output into the best element of the list.`;
    }

    if (dynamic_elements) {
      output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden\nAny output key containing < and > indicates you must generate the key name to replace it. Example input: {'<location>': 'description of location'}, Example output: {school: a place for education}`;
    }

    if (list_input) {
      output_format_prompt += `\nGenerate a list of JSON objects, one for each user query.`;
    }

    try {
      const geminiModel = genAI.getGenerativeModel({
        model: model,
        systemInstruction: system_prompt + output_format_prompt + error_msg,
        generationConfig: {
          temperature: temperature,
          responseMimeType: "application/json",
        },
      });

      const fullPrompt = Array.isArray(user_prompt)
        ? user_prompt.join("\n")
        : user_prompt.toString();

      const result = await geminiModel.generateContent(fullPrompt);
      const response = await result.response;

      // Extract text from JSON response
      let res = "";
      try {
        const jsonResponse = await response.json();
        res = JSON.stringify(jsonResponse);
      } catch {
        res = response.text();
      }

      // Clean and prepare for JSON parsing
      res = res.trim().replace(/'/g, '"');
      res = res.replace(/(\w)"(\w)/g, "$1'$2");

      if (verbose) {
        console.log(
          "System instruction:",
          system_prompt + output_format_prompt + error_msg
        );
        console.log("User prompt:", fullPrompt);
        console.log("Gemini response:", res);
      }

      let output: any = JSON.parse(res);

      if (list_input) {
        if (!Array.isArray(output)) {
          throw new Error("Output format not in a list of JSON objects");
        }
      } else {
        output = [output];
      }

      for (let index = 0; index < output.length; index++) {
        for (const key in output_format) {
          if (/<.*?>/.test(key)) {
            continue;
          }

          if (!(key in output[index])) {
            throw new Error(`${key} not in JSON output`);
          }

          if (Array.isArray(output_format[key])) {
            const choices = output_format[key] as string[];
            if (Array.isArray(output[index][key])) {
              output[index][key] = output[index][key][0];
            }
            if (!choices.includes(output[index][key]) && default_category) {
              output[index][key] = default_category;
            }
            if (output[index][key].includes(":")) {
              output[index][key] = output[index][key].split(":")[0];
            }
          }
        }

        if (output_value_only) {
          output[index] = Object.values(output[index]);
          if (output[index].length === 1) {
            output[index] = output[index][0];
          }
        }
      }

      return list_input ? output : output[0];
    } catch (e: any) {
      error_msg = `\n\nError: ${e.message}`;
      console.error(`Attempt ${i + 1} failed:`, e);
      if (verbose) console.error("Raw error:", e);
    }
  }

  throw new Error(`Failed to get valid output after ${num_tries} attempts`);
}
