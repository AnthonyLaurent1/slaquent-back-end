import "dotenv/config";
import { createServer } from "./src/server.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";
const { httpServer } = createServer();

httpServer.listen(PORT, HOST, () => {
  process.stdout.write(`Server listening on http://${HOST}:${PORT}\n`);
});
