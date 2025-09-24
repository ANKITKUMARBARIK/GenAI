/**
 * Implementation plan :---------------------------
 *
 * Stage 1: Indexing
 * 1. Load the document - pdf, text, etc.
 * 2. Chunk the document into smaller pieces
 * 3. Generate vector embeddings for each chunk
 * 4. Store the embeddings in a vector database (e.g., Pinecone, Weaviate, etc.)
 *
 * Stage 2: Using the chatbot
 * 1. Setup LLM
 * 2. Add retrieval step
 * 3. Pass input + relevant information to LLM
 * 4. Get response
 */

import { indexTheDocument } from "./prepare.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const filePath = "./cg-internal-docs.pdf";
await indexTheDocument(filePath);
