import axios from "axios";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const {
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_DEPLOYMENT_NAME,
  AZURE_OPENAI_API_VERSION
} = process.env;

// Function to parse resume from buffer
export const parseResumeData = async (resumeBuffer) => {
  try {
    const pdfData = await pdfParse(resumeBuffer);
    const resumeText = pdfData.text;

    const prompt = `
You are a resume parsing assistant. Your task is to extract structured information from raw resume text and return it as strict JSON.

⚠️ Projects and Work Experience must be clearly separated.

Each section must only contain the information relevant to it:
- Projects are personal or academic initiatives and should NOT be included under Experience.
- under the project setion also mention the technologies and tools used in the project.
- Experience refers to professional roles held at organizations or companies.
- 🔒 Only include "Experience" if the resume explicitly contains a section titled "Experience", "Work Experience", or "Professional Experience".

Return the following fields:

- Name
- Email
- Phone
- University
- Degree
- Skills (grouped as: Programming Languages, Frameworks & Libraries, Tools, Cloud Platforms, Databases, Other)
- Experience:
    - Company
    - Role
    - Duration
- Projects:
    - Name
    - Description
    - URL (if available)

Respond only with valid JSON. Do not include markdown or code blocks.

Resume:
"""${resumeText}"""
`;

    const response = await axios.post(
      `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`,
      {
        messages: [
          { role: "system", content: "You are an expert resume parser." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": AZURE_OPENAI_API_KEY
        }
      }
    );

    let content = response.data.choices[0].message.content.trim();
    if (content.startsWith("```")) {
      content = content.replace(/```json|```/g, "").trim();
    }

    return JSON.parse(content);
  } catch (err) {
    console.error("Parsing error:", err.message || err);
    throw new Error("Failed to parse resume.");
  }
};

export const parseResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    if (!fs.existsSync(req.file.path)) {
      return res.status(400).json({ error: "Uploaded file not found on server." });
    }
    
    const dataBuffer = fs.readFileSync(req.file.path);
    const result = await parseResumeData(dataBuffer);
    res.json(result);
  } catch (err) {
    console.error("Parsing error:", err.message || err);
    res.status(500).json({ error: "Failed to parse resume." });
  } finally {
    // Cleanup temp file
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
}; 