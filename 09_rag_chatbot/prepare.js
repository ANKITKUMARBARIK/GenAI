// https://byteshaala.notion.site/RAG-System-278dfcc4f3c7806d9c5de31b39bfcb6c

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

// configure the vector embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004", // 768 dimensions
    apiKey: process.env.GEMINI_API_KEY,
});

// configure the pinecone(vector database)
const pinecone = new PineconeClient();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// connect to the vector database
export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
});

export async function indexTheDocument(filePath) {
    // load the document
    const loader = new PDFLoader(filePath, { splitPages: true });
    const docs = await loader.load();
    console.log("PDF Loaded");

    // convert into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });

    // add metadata
    let documents = [];
    for (const doc of docs) {
        const chunks = await textSplitter.splitText(doc.pageContent);
        const chunkDocs = chunks.map((chunk) => ({
            pageContent: chunk,
            metadata: doc.metadata, // preserve per-page metadata
        }));
        documents = documents.concat(chunkDocs);
    }
    console.log("Chunking Completed");

    // langchain (chunking, embedding, database)-----------------------
    // chunk the document into smaller pieces
    // Generate vector embeddings for each chunk
    // Store the embeddings in a vector database
    await vectorStore.addDocuments(documents);
    console.log("Embeddings Generated");
    console.log("Data stored in vector database(pinecode)");
}
