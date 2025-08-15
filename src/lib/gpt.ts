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
  model: string = "gemini-2.0-flash",
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
): Promise<
  {
    question: string;
    answer: string;
    options?: string[]; // for MCQ
  }[]
> {
  const list_input = Array.isArray(user_prompt);
  const dynamic_elements = /<.*?>/.test(JSON.stringify(output_format));
  const list_output = /\[.*?\]/.test(JSON.stringify(output_format));

  let error_msg = "";

  // Helper delay
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  for (let i = 0; i < num_tries; i++) {
    let output_format_prompt = `\nYou are to output ONLY valid JSON in the format: ${JSON.stringify(
      output_format
    )}.\nDo NOT add explanations or extra text.`;

    if (list_output) {
      output_format_prompt += `\nIf a field is a list, pick the best matching element.`;
    }

    if (dynamic_elements) {
      output_format_prompt += `\nReplace <placeholders> with generated content.`;
    }

    if (list_input) {
      output_format_prompt += `\nOutput must be a JSON array of objects.`;
    }

    try {
      const geminiModel = genAI.getGenerativeModel({
        model,
        systemInstruction: system_prompt + output_format_prompt + error_msg,
        generationConfig: {
          temperature,
          responseMimeType: "application/json",
        },
      });

      const fullPrompt = list_input
        ? user_prompt.join("\n")
        : user_prompt.toString();

      const result = await geminiModel.generateContent(fullPrompt);
      const response = await result.response;

      let res = "";

      // Try structured output first
      try {
        const jsonResponse = await response.json();
        res = JSON.stringify(jsonResponse);
      } catch {
        res = await response.text();
      }

      // Clean common JSON issues
      res = res
        .trim()
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/(\r\n|\n|\r)/gm, " ");

      if (verbose) {
        console.log(
          "System instruction:",
          system_prompt + output_format_prompt + error_msg
        );
        console.log("User prompt:", fullPrompt);
        console.log("Gemini raw cleaned response:", res);
      }

      let output: any;
      try {
        output = JSON.parse(res);
      } catch (parseErr) {
        throw new Error(`Invalid JSON from Gemini: ${parseErr}`);
      }

      // Ensure array output
      if (list_input) {
        if (!Array.isArray(output)) {
          throw new Error("Output format is not an array of objects.");
        }
      } else {
        output = [output];
      }

      // Validate fields + fix MCQ options
      for (let index = 0; index < output.length; index++) {
        for (const key in output_format) {
          if (/<.*?>/.test(key)) continue;
          if (!(key in output[index])) {
            throw new Error(`${key} missing in output`);
          }

          if (Array.isArray(output_format[key])) {
            const choices = output_format[key] as string[];
            if (Array.isArray(output[index][key])) {
              output[index][key] = output[index][key][0];
            }
            if (!choices.includes(output[index][key]) && default_category) {
              output[index][key] = default_category;
            }
            if (
              typeof output[index][key] === "string" &&
              output[index][key].includes(":")
            ) {
              output[index][key] = output[index][key].split(":")[0];
            }
          }
        }

        // ✅ Extra handling for MCQ
        if ("options" in output[index]) {
          let opts = Array.isArray(output[index].options)
            ? output[index].options.map((o: string) => o.trim())
            : [];

          // Deduplicate
          opts = [...new Set(opts)];

          // Trim/pad to exactly 4
          if (opts.length > 4) opts = opts.slice(0, 4);
          while (opts.length < 4) {
            opts.push(`Option ${opts.length + 1}`);
          }

          // Ensure answer is included
          if (output[index].answer && !opts.includes(output[index].answer)) {
            opts[opts.length - 1] = output[index].answer;
          }

          output[index].options = opts;
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
      console.error(`Attempt ${i + 1} failed:`, e);

      if (e.status === 503 || e.message?.includes("overloaded")) {
        const waitTime = Math.pow(2, i) * 500;
        console.log(`Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
        if (i === num_tries - 2) {
          console.log("Switching to fallback model: gemini-2.0-pro");
          model = "gemini-2.0-pro";
        }
        continue;
      }

      error_msg = `\n\nError: ${e.message}`;
    }
  }

  throw new Error(`Failed to get valid output after ${num_tries} attempts`);
}
