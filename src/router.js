import express from "express";

const router = express.Router();

import User from './modules/user/user.router.js';
import ticket from './modules/ticketBooking/ticket.router.js';

// Routes
router.use('/user', User);  
router.use('/ticket', ticket);  

export default router