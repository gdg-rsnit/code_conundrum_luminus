import express from "express";
import dotenv from "dotenv";
import {connectDB} from "./config/db.js";
import cookieParser from "cookie-parser";

dotenv.config();
const port=process.env.PORT||5000;
const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.listen(port, () => console.log( `app running on port ${port}` ));

