import dotenv from "dotenv";
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import readline from "node:readline/promises";

dotenv.config({ path: "./.env" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// web search
const webSearch = async ({ query }) => {
    // Here we will do tavily api call
    console.log("Calling web search...");

    const response = await tvly.search(query);
    // const response = await tvly.search(query, {maxResults: 1});
    // console.log("Response: ", response);
    const finalResult = response.results.map((e) => e.content).join("\n\n"); //string
    // console.log("Final Result: ",finalResult)

    return finalResult;
};

const main = async () => {
    // readline interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

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

    // NOTE: user chat loop
    while (true) {
        // NOTE: web search loop
        const question = await rl.question("You: ");
        if (question == "bye") break;

        messages.push({
            role: "user",
            content: question,
            // When was iphone 16 launched?
            // What is the current weather in Mumbai?
        });

        while (true) {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                temperature: 0,
                messages: messages,
                // ---- implement tools ----
                // NOTE: bydefault LLM have access this type of tools, when we implement..
                tools: [
                    {
                        type: "function",
                        function: {
                            name: "webSearch",
                            description:
                                "Search the latest information and realtime on the internet.",
                            parameters: {
                                type: "object", // reason - webSearch func take object
                                properties: {
                                    // why "query" bcz webSearch func expect query property
                                    query: {
                                        type: "string",
                                        description:
                                            "The search query to perform search on.",
                                    },
                                },
                                required: ["query"], // *query property is required
                            },
                        },
                    },
                ],
                tool_choice: "auto", // optional, but useful
            });
            messages.push(completion.choices[0].message);

            // check LLM call tools or not
            const toolCalls = completion.choices[0].message.tool_calls;
            if (!toolCalls) {
                console.log(
                    `🤖 Assistant: ${completion.choices[0].message.content}`
                ); // normal calling
                break;
            }

            // may be, we use multiple tools that's why we use loops
            for (const tool of toolCalls) {
                // console.log("tool: ",tool);
                const functionName = tool.function.name;
                const functionParams = tool.function.arguments;

                if (functionName == "webSearch") {
                    const toolResult = await webSearch(
                        JSON.parse(functionParams)
                    ); // tool calling / result
                    // console.log("Tool result: ", toolResult);
                    messages.push({
                        tool_call_id: tool.id,
                        role: "tool",
                        name: functionName,
                        content: toolResult,
                    });
                }
            }

            // for testing purpose----------..

            // console.log(JSON.stringify(completion.choices[0].message, null, 2));
            // console.log(completion.choices[0].message);

            // console.log(JSON.parse(completion.choices[0].message.content));
        }
    }

    rl.close();
};

main();

/*
Example Flow: Tavily Search

User → “Bhai mujhe Delhi ka aaj ka weather bata.”
LLM → dekhta hai ki iske liye ek getWeather tool hai.
LLM → Tool call return karta hai { city: "Delhi" }.
Backend → Weather API ko call karta hai, data le aata hai { temp: 34 }.
Backend → LLM ko deta hai “Delhi weather is 34°C”.
LLM → Final reply deta hai: “Aaj Delhi ka temperature 34°C hai.”
*/
