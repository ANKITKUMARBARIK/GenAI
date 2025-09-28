import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generate } from "./chatbot.js";
import { updatePinecone } from "./prepare.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Welcome
app.get("/", (req, res) => res.send("Welcome to ByteShaala"));

// Chat API
app.post("/chat", async (req, res) => {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: "Missing question" });

    try {
        const answer = await generate(question);
        res.status(200).json({ message: answer });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Pinecone update API
app.get("/update-pinecone", async (req, res) => {
    try {
        await updatePinecone();
        res.status(200).json({ message: "Pinecone updated successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
