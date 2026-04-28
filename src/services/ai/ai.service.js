import { OpenAI } from "openai";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const systemPromptPath = path.join(__dirname, "system_prompt.txt");

// Utilisation de Qwen2.5 ou Qwen3 (selon dispo sur le router)
// Le format 0.5B / 0.6B est parfait pour ton besoin de rapidité.
const MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct:featherless-ai";

let systemPrompt = "";
try {
  systemPrompt = fs.readFileSync(systemPromptPath, "utf-8");
} catch {
  // missing system prompt is non-fatal
}

let client = null;

function ensureClient() {
  if (client) {return;};

  const apiKey = process.env.HF_TOKEN;
  if (!apiKey) {
    throw new Error("HF_TOKEN is not set");
  }

  client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey,
  });
}

/**
 * Generate text from the model via Hugging Face router.
 * @param {string} text - User input text.
 * @returns {Promise<string>} Model response text.
 */
export async function generateText(text) {
  process.stdout.write(`Vérification via Qwen (0.6B) : ${text.substring(0, 30)}...\n`);
  ensureClient();

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  // Pour Qwen, un prompt très direct fonctionne mieux.
  const promptInstruction = `Message: "${text}"\n\nRéponds par 'oui' ou 'non' uniquement.`;

  messages.push({ role: "user", content: promptInstruction });

  try {
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages,
      temperature: 0.1,
      max_tokens: 3, // Légèrement augmenté à 3 pour gérer d'éventuels espaces
      // On ajoute les balises spécifiques de Qwen pour forcer l'arrêt propre
      stop: ["<|im_end|>", "<|endoftext|>", "\n", ".", " "],
    });

    // Nettoyage strict : on ne garde que les lettres a-z
    const rawOut = response?.choices?.[0]?.message?.content ?? "";
    const out = rawOut.toLowerCase().trim().replaceAll(/[^a-z]/g, "");

    // Log propre
    if (out) {
      process.stdout.write(`AI Result: [${out}]\n`);
    } else {
      process.stdout.write("AI Result: Empty or invalid\n");
    }

    return out;
  } catch (error) {
    process.stderr.write(`AI request error: ${error?.message || error}\n`);
    return "";
  }
}
