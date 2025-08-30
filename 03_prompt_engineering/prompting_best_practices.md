
# 📘 Prompt Engineering Guide
====================================

Prompt engineering is an essential skill for obtaining optimal results from AI models.
Here is the simplest, clearest advice to help you get started quickly and efficiently.

---

## 🔹 Start Simple, Then Add Complexity
------------------------------------------------

Begin with straightforward prompts. Gradually add complexity or additional context, and **experiment regularly**.
AI playgrounds like those from **OpenAI** or **Cohere** are ideal for practicing.

### Example of Iteration:

- **Initial Prompt:**
  `"Summarize this text."`

- **Improved Prompt:**
  `"Summarize this text into three concise bullet points."`

---

## 🔹 Give Clear Instructions
--------------------------------

Always give direct instructions at the **beginning** of your prompt.
Use clear separators like `#` or triple quotes `"""` to distinguish between instructions and context.

### Example:

Instruction

Translate the following sentence into French:

Text: "Good morning!"

Output:
Bonjour!

---

## 🔹 Be Specific, Not General
---------------------------------

Specific prompts yield clearer, more accurate responses.
Clearly articulate your desired **outcome, style, length, or format**.

### Example:

- **General Prompt:**
  `"Write about OpenAI."`

- **Specific Prompt:**
  `"Write a brief, inspiring paragraph about OpenAI's latest innovation, DALL-E, in a conversational tone."`

---

## 🔹 Use Examples to Guide Formatting
-----------------------------------------

Illustrate exactly what you want the output to look like using examples.

### Example:

Extract company and person names from this text.

Desired format:
Company Names: Google, OpenAI
People Names: Sundar Pichai, Sam Altman

Text: {Your Text Here}

---

## 🔹 Focus on What To Do (Not What Not To Do)
---------------------------------------------------

Rather than telling the model what **not** to do, specify what it **should** do.

- **Less Effective:**
  `"Do NOT ask users for their personal information."`

- **More Effective:**
  `"Only recommend movies from the top global trending list. If no recommendation is available, say: 'Sorry, couldn't find a movie to recommend today.'"`

---

## 🔹 Zero-Shot vs Few-Shot Prompting
-----------------------------------------

- **Zero-shot Prompting:** No examples are provided.
- **Few-shot Prompting:** Include examples to guide the model.

### Example:

**Zero-shot:**
Extract keywords from the following text:
Text: {Your Text Here}

**Few-shot:**
Extract keywords from the corresponding texts below:

Text 1: "OpenAI develops powerful AI models."
Keywords 1: OpenAI, AI models

Text 2: {Your Text Here}
Keywords 2:

---

## 🔹 Avoid Vague Language
---------------------------

Be concise and structured.

- **Less Effective:**
  `"Describe this product briefly and clearly."`

- **More Effective:**
  `"Describe this product in 2-3 concise sentences."`

---

## 🔹 Prompting for Code
-------------------------

When prompting for code, use **language-specific keywords** like `import` (Python) or `SELECT` (SQL).

### Example (Python):

Write a Python function converting miles to kilometers

---

## ✅ Key Takeaways
--------------------

- Keep prompts **clear, specific, and structured**
- Use **examples** to guide output formatting
- Avoid negative phrasing - tell the model **what to do**
- Iterate, refine, and experiment for best results

Prompt engineering is **iterative and experimental**. The more you practice, the better your results!
