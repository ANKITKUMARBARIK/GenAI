import dotenv from "dotenv";
import Groq from "groq-sdk";
import { vectorStore } from "./prepare.js";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generate = async (question) => {
    const relevantChunks = await vectorStore.similaritySearch(question, 3);
    const context = relevantChunks.map((c) => c.pageContent).join("\n\n");

    const messages = [
        {
            role: "system",
            content: `
You are a helpful AI assistant. Only use the context below to answer questions.
Rules:
1. Answer strictly from the context.
2. If context partially answers, state what you know and politely mention missing info.
3. If no relevant info, say: "Sorry, I don't find this information."
4. Keep it short and clear.
      `,
        },
        {
            role: "user",
            content: `Question: ${question}\nContext:\n${context}\nAnswer:`,
        },
    ];

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        messages,
    });

    return completion.choices[0].message.content;
};
