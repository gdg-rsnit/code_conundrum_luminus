import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";


import userRoutes from "./routes/user.routes.js";
import teamRoutes from "./routes/team.routes.js";


dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/team", teamRoutes);

app.listen(port, () => console.log(`app running on port ${port}`));

