import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { generate } from "./chatbot.js";

dotenv.config({ path: "./.env" });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("Welcome to ByteShaala");
});

app.post("/chat", async (req, res) => {
    const { message } = req.body;
    const result = await generate(message);

    return res.status(200).json({ message: result });
});

app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));
