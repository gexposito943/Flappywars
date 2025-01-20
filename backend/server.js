import express from "express";
import dotenv from "dotenv";
import routes from "./routes/routes.js";
import cors from "cors";
import xss from "xss-clean";
import { logRequest } from "./middlewares/logger.js";

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

app.use((req, res, next) => logRequest(req, res, next));
// app.use((req, res, next) => {
//   res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
//   res.setHeader("Cross-Origin.Embedder-Policy", "require-corp");
// });
app.use(cors());
app.use(express.json());
app.use(xss());

app.use("/api/v1", routes);
app.get("/", (req, res) => {
  res.send("Hola mon");
});
app.listen(PORT, () => {
  console.log(`Servidor funcionant`);
});
