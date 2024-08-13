//serverr/src/server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3004;

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, "../../client/dist")));
app.use(express.json());
app.use(router);

// Handle all other routes by serving the index.html file
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
  console.log(`Open http://localhost:${PORT} to view the application`);
});
