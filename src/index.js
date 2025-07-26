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
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT","DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie", "*"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

 db();

app.get("/", (req, res) => {
  res.send("Hello Dosto");
});

app.use("/api/v1/users", authRoutes);

app.listen(port, () => {
  console.log("Listing on : 3000");
});
