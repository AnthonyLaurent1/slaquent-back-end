import { Client } from "@gradio/client";

export function modifyContent(content) {

}

function createGradioClient() {
    const client = await Client.connect("hysts/mistral-7b");
    return client;
}