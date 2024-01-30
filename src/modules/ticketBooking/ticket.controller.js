import { Op } from "sequelize";
import { decodeJWT } from "../user/user.modal.js";
import { FlightBooking, Passenger } from "./ticket.modal.js";

// export const createFlightBooking = async (req, res) => {
//   try {
//     const {
//       email,
//       phoneNumber,
//       departure,
//       arrival,
//       travelClass,
//       sectorImagePath,
//       itineraryTypes,
//       Passengers
//     } = req.body;

//     // let passengers = req.body.Passengers;

//     const payload = decodeJWT(req.headers.authorization);
//     if (payload) {
//       console.log(payload, "inside payload");

//       FlightBooking.hasMany(Passenger, { foreignKey: "flightBookingId" });
//       Passenger.belongsTo(FlightBooking, { foreignKey: "flightBookingId" });

//       // Create FlightBooking
//       const newFlightBooking = await FlightBooking.create({
//         email,
//         phoneNumber,
//         departure,
//         arrival,
//         travelClass,
//         dealerId: payload.id,
//         dealerName: payload.name,
//         imagePath: payload.imagePath,
//         sectorImagePath,
//         itineraryTypes
//       });

//       // Create Passengers associated with the FlightBooking
//       if (Passengers && Passengers.length > 0) {
//         await Promise.all(
//           Passengers.map(async (passengerData) => {
//             await Passenger.create({
//               ...passengerData,
//               flightBookingId: newFlightBooking.id, // Associate with the created FlightBooking
//             });
//           })
//         );
//       }

//       res.status(200).json({
//         message: "Flight booking created successfully",
//         success: true,
//       });
//     } else {
//       return res.status(401).json({
//         message: "Session Expired",
//         success: false,
//       });
//     }
//   } catch (error) {
//     console.error("Error creating flight booking:", error);
//     res.status(500).json({
//       error: "An error occurred while creating the flight booking",
//       success: false,
//     });
//   }
// };

export const createFlightBooking = async (req, res) => {
  try {
    const {
      id,
      email,
      phoneNumber,
      departure,
      arrival,
      travelClass,
      sectorImagePath,
      itineraryTypes,
      amount,
      ticketStatus,
      ticketImageUrl,
      Passengers,
    } = req.body;

    const payload = decodeJWT(req.headers.authorization);
    if (payload) {
      console.log(payload, "inside payload");

      FlightBooking.hasMany(Passenger, { foreignKey: "flightBookingId" });
      Passenger.belongsTo(FlightBooking, { foreignKey: "flightBookingId" });

      // If flightBookingId exists, it's an update; otherwise, it's a create operation
      if (id) {
        const updatedFlightBooking = await FlightBooking.findByPk(id);
        if (!updatedFlightBooking) {
          return res.status(404).json({
            message: "Flight booking not found",
            success: false,
          });
        }

        const updatedItem = await updatedFlightBooking.update({
          email,
          phoneNumber,
          departure,
          arrival,
          travelClass,
          // dealerId: payload.id,
          // dealerName: payload.name,
          // imagePath: payload.imagePath,
          sectorImagePath,
          itineraryTypes,
          amount,
          ticketStatus,
          ticketImageUrl,
        });

        const existingPassengers = await Passenger.findAll({
          where: {
            flightBookingId: id, // Use the provided flight booking ID
          },
        });

        if (existingPassengers && existingPassengers.length > 0) {
          // Find IDs of passengers that are present in the existing database but not in the updated request
          const passengersToRemove = existingPassengers.filter(
            (existingPassenger) => {
              return !Passengers.some(
                (updatedPassenger) =>
                  updatedPassenger.id === existingPassenger.id
              );
            }
          );

          // Delete passengers that need to be removed
          await Promise.all(
            passengersToRemove.map(async (passengerToRemove) => {
              await passengerToRemove.destroy();
            })
          );
        }

        // Update or Create Passengers associated with the FlightBooking
        if (Passengers && Passengers.length > 0) {
          await Promise.all(
            Passengers.map(async (passengerData) => {
              if (passengerData.id) {
                const existingPassenger = await Passenger.findByPk(
                  passengerData.id
                );
                if (existingPassenger) {
                  await existingPassenger.update({
                    ...passengerData,
                    flightBookingId: updatedItem.id,
                  });
                }
              } else {
                await Passenger.create({
                  ...passengerData,
                  flightBookingId: updatedItem.id,
                });
              }
            })
          );
        }

        res.status(200).json({
          message: "Flight booking updated successfully",
          success: true,
        });
      } else {
        // Create FlightBooking
        const newFlightBooking = await FlightBooking.create({
          email,
          phoneNumber,
          departure,
          arrival,
          travelClass,
          dealerId: payload.id,
          dealerName: payload.name,
          imagePath: payload.imagePath,
          sectorImagePath,
          itineraryTypes,
          amount,
          ticketStatus,
          ticketImageUrl,
        });

        // Create Passengers associated with the FlightBooking
        if (Passengers && Passengers.length > 0) {
          await Promise.all(
            Passengers.map(async (passengerData) => {
              await Passenger.create({
                ...passengerData,
                flightBookingId: newFlightBooking.id,
              });
            })
          );
        }

        res.status(200).json({
          message: "Flight booking created successfully",
          success: true,
        });
      }
    } else {
      return res.status(401).json({
        message: "Session Expired",
        success: false,
      });
    }
  } catch (error) {
    console.error("Error creating/updating flight booking:", error);
    res.status(500).json({
      error: "An error occurred while processing the request",
      success: false,
    });
  }
};

export const getTicketList = async (req, res) => {
  try {
    const payload = decodeJWT(req.headers.authorization);
    FlightBooking.hasMany(Passenger, { foreignKey: "flightBookingId" });
      Passenger.belongsTo(FlightBooking, { foreignKey: "flightBookingId" });
    if (payload) {
      const { searchKeyword, dealerId, page, pageSize } = req.query;
      let whereCondition = {};
      let passengerWhereCondition = {};
      if (payload.role === 1) {
        // For other payload.role values, fetch based on payload.id
        whereCondition = {
          dealerId: payload.id,
        };
        if (searchKeyword) {
          whereCondition = {
            ...whereCondition,
            [Op.or]: [
              { email: { [Op.like]: `%${searchKeyword}%` } },
              { dealerName: { [Op.like]: `%${searchKeyword}%` } },
              // Add other fields for searching here
            ],
          };
          // passengerWhereCondition = {
          //   ...passengerWhereCondition,
          //   [Op.or]: [
          //     { givenName: { [Op.like]: `%${searchKeyword}%` } },
          //     { passportNumber: { [Op.like]: `%${searchKeyword}%` } },
          //     // Add other fields for searching here
          //   ],
          // };
        }
      } else {
        passengerWhereCondition = {
          [Op.or]: [
            { '$Passengers.givenName$': { [Op.like]: `%${searchKeyword}%` } },
            { '$Passengers.lastName$': { [Op.like]: `%${searchKeyword}%` } },
            // Add other fields for searching here
          ],
        };
        // For payload.role = 0, fetch all data
        //    whereCondition = {};
        if (dealerId) {
          whereCondition = {
            ...whereCondition,
            dealerId: dealerId,
          };
        }
        if (searchKeyword) {
          whereCondition = {
            ...whereCondition,
            [Op.or]: [
              { email: { [Op.like]: `%${searchKeyword}%` } },
              { dealerName: { [Op.like]: `%${searchKeyword}%` } },

              // Add other fields for searching here
            ],
          };
          
        }
      }

      // Pagination
      const pageNumber = page ? parseInt(page) : 1;
      const limit = pageSize ? parseInt(pageSize) : 10;
      const offset = (pageNumber - 1) * limit;

      // Retrieve all flight bookings with associated passengers
      const ticketList = await FlightBooking.findAndCountAll({
        include: [
          {
            model: Passenger,
            //   as: 'passengers', // Use the correct alias for the association as defined in the association
            attributes: [
              "id",
              "givenName",
              "lastName",
              "passportNumber",
              "dateOfBirth",
              "issuingDate",
              "expiryDate",
              "nationality",
              "travellerType",
              "passportImagePath",
            ],
          },
        ],
        attributes: [
          "id",
          "email",
          "departure",
          "arrival",
          "dealerName",
          "dealerId",
          "imagePath",
          "createdAt",
          "sectorImagePath",
          "itineraryTypes",
          "travelClass",
          "phoneNumber",
          "amount",
          "ticketStatus",
          "ticketImageUrl",
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        where: whereCondition, // Assuming whereCondition is defined elsewhere
      });

      const totalPages = Math.ceil(ticketList.count / limit);

      res.status(200).json({
        ticketList: ticketList.rows,
        totalPages: totalPages,
        currentPage: parseInt(page),
        totalUsers: ticketList.count,
        success: true,
      });
    } else {
      return res.status(401).json({
        message: "Session Expired", 
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching ticket list:", error);
    res.status(500).json({
      error: "An error occurred while fetching the ticket list",
      success: false,
    });
  }
};

export const getDashboardWidgetDetails = async (req, res) => {
  try {
    const payload = decodeJWT(req.headers.authorization);

    if (payload.role === 0 || payload.role === 2) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0); // Start of today

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999); // End of today

      let whereCondition = {
        createdAt: {
          [Op.between]: [todayStart, todayEnd],
        },
      };

      const totalTickets = await FlightBooking.count();
      const todayCreatedTickets = await FlightBooking.count({
        where: whereCondition,
      });

      whereCondition = {
        ticketStatus: {
          [Op.in]: [1, 2],
        },
      };

      const openTicketsCount = await FlightBooking.count({
        where: whereCondition,
      });

      res.json({
        totalTickets,
        todayCreatedTickets,
        openTicketsCount,
      });
    }
    else if (payload.role === 1) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0); // Start of today

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999); // End of today

      let whereCondition = {
        createdAt: {
          [Op.between]: [todayStart, todayEnd],
        },
        dealerId: payload.id, // Assuming there's a userId associated with tickets for role 1 user
      };

      const totalTickets = await FlightBooking.count({
        where: {
          dealerId: payload.id,
        },
      });

      const todayCreatedTickets = await FlightBooking.count({
        where: whereCondition,
      });

      whereCondition = {
        ticketStatus: {
          [Op.in]: [1, 2],
        },
        dealerId: payload.id,
      };

      const openTicketsCount = await FlightBooking.count({
        where: whereCondition,
      });

      res.json({
        totalTickets,
        todayCreatedTickets,
        openTicketsCount,
      });
    } 
    else {
      res.status(403).json({ message: "Unauthorized access" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
