import express from "express";
import cors from "cors";
import globalErrorHandler from "./utils/globalErrorHandler.js";
import voterRoutes from "./routes/voter.routes.js";
import voteRoutes from "./routes/vote.routes.js";
import candidateRoutes from "./routes/Candidate.routes.js";
import cookieParser from "cookie-parser";

const app = express();

// middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // 👈 specify your frontend origin here
    credentials: true, // 👈 allow cookies
  })
);
// routes
app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

app.get("/health", (req, res) => {
  res.send("Healthy");
});
app.use("/api/v1/voters", voterRoutes);
app.use("/api/v1/vote", voteRoutes);
app.use("/api/v1/candidate", candidateRoutes);

app.use(globalErrorHandler);

export { app };
