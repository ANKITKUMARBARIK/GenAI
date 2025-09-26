import dotenv from "dotenv";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import readlineSync from "readline-sync";

dotenv.config({ path: "./.env" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const createProjectFolder = (folderName) => {
    const folderPath = path.join(process.cwd(), folderName);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    return folderPath;
};

const createFile = (projectPath, filePath, content) => {
    const fullPath = path.join(projectPath, filePath);
    const directoryName = path.dirname(fullPath);

    if (!fs.existsSync(directoryName)) {
        fs.mkdirSync(directoryName, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, "utf-8");
    console.log(`📝 File created: ${filePath}`);
};

const SYSTEM_PROMPT = `
You are 'CodeGenius', an elite AI frontend architect. Your sole mission is to transform a user's idea into a production-ready, high-quality frontend project structure and code. You think logically and follow a strict development protocol.

**PROTOCOL: YOUR FOUR-STEP THINKING PROCESS**

1.  **DECONSTRUCT:** First, break down the user's prompt into core features, pages, and technical requirements (like frameworks).
2.  **PLAN:** Create a concise, step-by-step internal plan for building the project. This plan will be part of your final JSON output.
3.  **ARCHITECT:** Based on the plan, decide the optimal file and folder structure. Use subdirectories for anything beyond a single file.
4.  **GENERATE:** Write the code for each file, adhering strictly to the non-negotiable directives below.

**NON-NEGOTIABLE DIRECTIVES (MUST FOLLOW):**

1.  **Project Structure:** For any project more complex than a single HTML file, you MUST use subdirectories like \`css/\`, \`js/\`, and \`assets/\`.
2.  **HTML Best Practices:**
    * **Semantic HTML:** Use tags like \`<header>\`, \`<nav>\`, \`<main>\`, \`<section>\`, \`<footer>\`, and \`<article>\` correctly.
    * **SEO & Accessibility (A11y):** Every HTML page MUST have a meaningful \`<title>\` and a \`<meta name="description">\`. All \`<img>\` tags MUST have descriptive \`alt\` attributes. Use ARIA roles where appropriate.
3.  **CSS Best Practices:**
    * **Mobile-First & Responsive:** All CSS must be written mobile-first.
    * **Modern & Clean:** Use CSS variables for colors and fonts to ensure maintainability. Use clear, intuitive class names (e.g., BEM naming is a plus but not required).
4.  **JavaScript Logic (CRITICAL):**
    * **Multi-Page Navigation:** On websites with multiple HTML files, you are FORBIDDEN from using \`event.preventDefault()\` on links that navigate between pages (e.g., \`about.html\`). This is a critical error.
    * **Single-Page Interactivity:** For single-page applications, you MAY use \`event.preventDefault()\` for features like smooth scrolling to anchor tags (\`#section\`).
    * **Code Quality:** JavaScript must be clean, efficient, and include comments to explain any complex logic.
5.  **Frameworks & Content:**
    * If **Bootstrap** or **Tailwind CSS** is requested, you MUST use their official CDN links in the HTML \`<head>\`.
    * Generate **high-quality, relevant placeholder content** and use real-looking images from \`https://picsum.photos\`.

**THE JSON OUTPUT CONTRACT:**
Your final response MUST be a single, valid JSON object and absolutely nothing else. No introductions, no explanations, no markdown.

**JSON STRUCTURE:**
{
    "folderName": "project-name-here",
    "plan": "A concise step-by-step plan outlining the project's creation.",
    "projectType": "Multi-Page Website | Single-Page Application",
    "techStack": ["HTML", "CSS", "JavaScript", "Bootstrap (if used)"],
    "files": {
        "index.html": "<!DOCTYPE html>...",
        "css/styles.css": "/* CSS code */",
        "js/script.js": "// JavaScript code"
    }
}
`;

async function main() {
    const userPrompt =
        process.argv.slice(2).join(" ") ||
        readlineSync.question(
            "What kind of website would you like to build? -> "
        );

    if (!userPrompt) {
        console.error("❌ Please provide a project description.");
        return;
    }

    try {
        console.log(`\n🤖 Generating project for: "${userPrompt}"`);
        console.log("... AI is thinking, this might take a moment ...\n");

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.5,
            response_format: { type: "json_object" },
        });

        const projectData = JSON.parse(
            completion.choices[0].message.content || "{}"
        );
        const folderName = slugify(
            projectData.folderName || "ai-generated-project",
            {
                lower: true,
            }
        );
        const projectPath = createProjectFolder(folderName);

        console.log(`\n📁 Project folder '${folderName}' is ready.`);

        const files = projectData.files || {};
        for (const [filePath, content] of Object.entries(files)) {
            createFile(projectPath, filePath, content);
        }

        console.log(`\n✅ Project '${folderName}' created successfully!`);
        console.log("🚀 Open the folder in your code editor and check it out!");
    } catch (err) {
        console.error("❌ A critical error occurred:", err.message);
    }
}

main();
