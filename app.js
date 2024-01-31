import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import apiRouter from "./src/router.js"
import { sequelize } from "./src/modules/user/user.modal.js";
import path from "path";
import { fileURLToPath } from 'url';
import http from 'http';

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors());

app.use("/", apiRouter);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static('public')); 
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
//for static file loading like images
// app.use('/uploads', express.static('uploads/userProfile'));


// sequelize.sync().then(() => {
//   app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//   });
// });
