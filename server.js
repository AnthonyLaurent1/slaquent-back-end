import "dotenv/config";
/* global process */
import { createServer } from "./src/server.js";

const PORT = Number(process.env.PORT ?? 3000);
const { httpServer } = createServer();

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
