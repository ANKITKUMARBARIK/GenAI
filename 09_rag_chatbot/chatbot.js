import dotenv from "dotenv";
import Groq from "groq-sdk";
import { vectorStore } from "./prepare.js";

dotenv.config({ path: "./.env" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generate = async (question) => {
    const relevantChunks = await vectorStore.similaritySearch(question, 3);
    const context = relevantChunks
        .map((chunk) => chunk.pageContent)
        .join("\n\n");

    const messages = [
        {
            role: "system",
            content: `
                You are a helpful AI assistant specialized in answering questions using only the given context from retrieved documents. 

                Rules you must follow:
                1. Always base your answer strictly on the provided context.
                2. If the context fully answers the query, explain clearly and concisely.
                3. If the context partially answers, mention what is available and state politely that more info is not in the provided documents.
                4. If the context has no relevant info, say: "Sorry, I don't find this information in the provided documents."
                5. Do not hallucinate or make up answers outside the context.
                6. Keep answers short, simple, and user-friendly.
            `,
        },
    ];

    const userQuery = `
        Question: ${question}
        Relevant Context: ${context}
        Answer: 
    `;

    messages.push({
        role: "user",
        content: userQuery,
    });

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        messages: messages,
    });

    return completion.choices[0].message.content;
};
