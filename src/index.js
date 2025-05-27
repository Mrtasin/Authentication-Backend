import express from "express";
import dotenv from "dotenv";
import db from "./libs/db.js";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();

const port = process.env.PORT || 4000;

const app = express();

app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Contant-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

await db();

app.get("/", (req, res) => {
  res.send("Hello Dosto");
});

app.use("/api/v1/users", authRoutes);

app.listen(port, () => {
  console.log("Listing on : 3000");
});
