import { OpenAI } from "openai";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const systemPromptPath = path.join(__dirname, "system_prompt.txt");

const system_prompt = fs.readFileSync(systemPromptPath, "utf-8");

let globalClient = null;

async function initializeOllamaClient() {
    // Ollama expose un endpoint compatible OpenAI sur le port 11434
    globalClient = new OpenAI({
        baseURL: "http://127.0.0.1:11434/v1", 
        apiKey: "ollama", // Une clé est requise par le SDK mais ignorée par Ollama
    });
    console.warn("Client initialisé sur l'instance locale Ollama");
}

export async function modifyContent(content) {
    console.log("Contenu original:", content);
    if (!globalClient) {
        await initializeOllamaClient();
    }

    try {
        console.log("Envoi à Ollama pour modification...");
        const response = await globalClient.chat.completions.create({
            model: "qwen3.5:0.8b", 
            messages: [
                { role: "system", content: system_prompt },
                { role: "user", content: content },
            ],
            temperature: 0.1, 
        });

        console.log("Réponse d'Ollama:", response.choices[0].message.content);
        return response.choices[0].message.content;
    } catch (error) {
        console.error("Erreur Ollama:", error.message);
        return content; 
    }
}