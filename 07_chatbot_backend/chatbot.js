import dotenv from "dotenv";
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

dotenv.config({ path: "./.env" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const webSearch = async ({ query }) => {
    console.log("Calling web search...");

    const response = await tvly.search(query);
    const finalResult = response.results.map((e) => e.content).join("\n\n");

    return finalResult;
};

export const generate = async (message) => {
    const messages = [
        {
            role: "system",
            content: `
                You are a smart personal assistant who answers the asked questions.

                You have access to following tools:
                1. webSearch({query}: {query: string}) // Search the latest information and realtime on the internet.
                current date and time: ${new Date().toUTCString()}
            `,
        },
        // {
        //     role: "user",
        //     content: `What is the current weather in Mumbai?`,
        //     // When was iphone 16 launched?
        //     // What is the current weather in Mumbai?
        // },
    ];

    messages.push({
        role: "user",
        content: message,
    });

    while (true) {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            messages: messages,
            tools: [
                {
                    type: "function",
                    function: {
                        name: "webSearch",
                        description:
                            "Search the latest information and realtime on the internet.",
                        parameters: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description:
                                        "The search query to perform search on.",
                                },
                            },
                            required: ["query"],
                        },
                    },
                },
            ],
            tool_choice: "auto",
        });
        messages.push(completion.choices[0].message);

        const toolCalls = completion.choices[0].message.tool_calls;
        if (!toolCalls) {
            return completion.choices[0].message.content;
        }

        for (const tool of toolCalls) {
            const functionName = tool.function.name;
            const functionParams = tool.function.arguments;

            if (functionName == "webSearch") {
                const toolResult = await webSearch(JSON.parse(functionParams));
                messages.push({
                    tool_call_id: tool.id,
                    role: "tool",
                    name: functionName,
                    content: toolResult,
                });
            }
        }
    }
};
