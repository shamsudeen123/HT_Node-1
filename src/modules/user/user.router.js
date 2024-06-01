import express from "express";
import { addUser, findAllUsers, getAllUsers, login, uploadFiles } from "./user.controller.js";
import { sendConfirmationEmail } from "../gmail-auth/gmail.js";

const router = express.Router();


// Routes
router.post('/login', login);
router.post('/addUser', addUser);
router.get('/findAllUsers', findAllUsers);
router.post('/uploadFiles', uploadFiles);
router.get('/getAllUsers', getAllUsers);
router.post('/email', sendConfirmationEmail); 



export default router