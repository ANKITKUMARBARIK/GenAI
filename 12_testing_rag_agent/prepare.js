import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import dotenv from "dotenv";
import { getCoursesText } from "./mongoCourses.js";

dotenv.config();

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    apiKey: process.env.GEMINI_API_KEY,
});

const pinecone = new PineconeClient();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
});

export async function updatePinecone() {
    await pineconeIndex.deleteAll({
        deleteAll: true,
        namespace: "",
    });
    console.log("Old Pinecone data deleted");

    const courses = await getCoursesText();

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
    });

    let documents = [];
    for (const course of courses) {
        const chunks = await textSplitter.splitText(course.pageContent);
        const chunkDocs = chunks.map((chunk) => ({
            pageContent: chunk,
            metadata: course.metadata,
        }));
        documents = documents.concat(chunkDocs);
    }

    console.log("Chunking Completed");
    await vectorStore.addDocuments(documents);
    console.log("Embeddings Generated & Stored in Pinecone");
}
