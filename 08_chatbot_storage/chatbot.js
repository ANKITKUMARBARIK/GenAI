import dotenv from "dotenv";
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import NodeCache from "node-cache";

dotenv.config({ path: "./.env" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const cache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // 24 hours

const webSearch = async ({ query }) => {
    console.log("Calling web search...");

    const response = await tvly.search(query);
    const finalResult = response.results.map((e) => e.content).join("\n\n");

    return finalResult;
};

export const generate = async (message, threadId) => {
    const baseMessages = [
        {
            role: "system",
            content: `
                You are a smart personal assistant.
                If you know the answer to a question, answer it directly in plain English.

                If the answer requires real-time, local, or up-to-date information, or if you don’t know the answer, use the available tools to find it.

                You have access to the following tool:
                webSearch(query: string): Use this to search the internet for current or unknowninformation.

                Decide when to use your own knowledge and when to use the tool.
                Do not mention the tool unless needed.

                Examples:
                Q: What is the capital of France?
                A: The capital of France is Paris.

                Q: What’s the weather in Mumbai right now?
                A: (use the search tool to find the latest weather)

                Q: Who is the Prime Minister of India?
                A: The current Prime Minister of India is Narendra Modi.

                Q: Tell me the latest IT news.
                A: (use the search tool to get the latest news)

                current date and time: ${new Date().toUTCString()}
            `,
        },
    ];

    const messages = cache.get(threadId) ?? baseMessages;

    messages.push({
        role: "user",
        content: message,
    });

    const MAX_RETRIES = 10;
    let count = 0;

    while (true) {
        if (count > MAX_RETRIES)
            return "I'm sorry, I could not generate a response. Please try again later.";

        count++;

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
            cache.set(threadId, messages);
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
