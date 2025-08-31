import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config({ debug: false });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const main = async () => {
    const completion = await groq.chat.completions.create({
        // NOTE: LLM settings
        temperature: 1,
        // top_p: 0.2,
        /* 
        NOTE:-
        * 1. item 1
        * 2. item 2
        * ....
        * 10. item 10
        * 11. item 11
        */
        // stop: "11",  // stop: "ga", // Negative
        // max_completion_tokens: 1000,
        // max_tokens: "",
        // frequency_penalty: 1,
        // presence_penalty: 1,
        // NOTE: Structure format output wit prompt - SECOND WAY
        response_format: { type: "json_object" }, 
        model: "llama-3.3-70b-versatile",
        messages: [
            // NOTE: give persona / system-promt
            // {
            //     role: "system",
            //     content: `You are Ankit, a smart review grader. Your task is to analyze given review and return the sentiment.

            //     Classify the review as positive, neutral or negative. Output must be a single word.`,
            // },

            // NOTE: Structured output with prompt - FIRST WAY
            // {
            //     role: "system",
            //     content: `You are Ankit, a smart review grader. Your task is to analyze given review and return the sentiment.

            //     Classify the review as positive, neutral or negative. You must return the result in valid JSON structure.
            //     example: {"sentiment":"Negative"}
            //     `,
            // },
            // {
            //     role: "user",
            //     content: `Review: These headphones arrived quickly and look great, but the left earcup stopped working after a week.
            //     Sentiment: `,
            // },

            // NOTE:
            {
                role: "system",
                content: `You are an interview grader assistant. Your task is to generate candidate evaluation score. Output must be following JSON structure:
                {
                    "confidence": number (1-10 scale),
                    "accuracy": number (1-10 scale),
                    "pass": boolean (true or false)
                }
                The response must:
                    1. Include ALL fields shown above
                    2. Use only the exact field names shown
                    3. Follow the exact data types specified
                    4. Contain ONLY the JSON object and nothing else
                `,
            },
            {
                role: "user",
                content: `
                    Q: What does = do in JavaScript?
                        A: It checks strict equality-both value and type must match.
                    Q: How do you create a promise that resolves after 1 second?
                        A: const p = new Promise(r => setTimeout(r, 1000));
                    Q: What is hoisting?
                        A: JavaScript moves declarations (but not initializations) to the top of their scope before code runs.
                    Q: Why use let instead of var?
                        A: let is block-scoped, avoiding the function-scope quirks and re-declaration issues of var.
                `
            }
        ],
    });

    // Extract the response
    console.log(completion.choices[0].message.content);

    // Parse and validate JSON
    // console.log(JSON.parse(completion.choices[0].message.content));
};

main();


// https://openai.com/index/introducing-structured-outputs-in-the-api/