import express from "express";
import { createFlightBooking, getDashboardWidgetDetails, getTicketList } from "./ticket.controller.js";

const router = express.Router();


// Routes
router.post('/createTicket', createFlightBooking);
router.get('/getTicketList', getTicketList);
router.get('/getDashboardWidgetDetails', getDashboardWidgetDetails);

export default router