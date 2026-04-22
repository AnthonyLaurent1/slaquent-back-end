import { Client } from "@gradio/client";

export async function modifyContent(content) {
    const client = createGradioClient();
    const result = await client.predict("/generate", {
		message: "Hello!!",
		max_new_tokens: 1024,
		temperature: 0.6,
		top_p: 0.9,
		top_k: 50,
		repetition_penalty: 1.2,
    })

    return result.data;
}

async function createGradioClient() {
    const client = await Client.connect("hysts/mistral-7b");
    return client;
}