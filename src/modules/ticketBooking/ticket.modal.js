import { Sequelize, DataTypes } from "sequelize";

// Database configuration
// export const sequelize = new Sequelize('harizon_travels', 'root', 'samsudeen', {
//   host: 'localhost',
//   dialect: 'mysql',
//   port: 3306
// });

export const sequelize = new Sequelize('harizontravels', 'root', 'oneteam@123', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306
});

export const FlightBooking = sequelize.define("FlightBooking", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^[0-9]{10}$/,
    },
  },
  departure: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passengerName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  arrival: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  itineraryTypes: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  travelClass: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dealerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dealerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  updatedBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sectorImagePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ticketStatus: {
    type: DataTypes.STRING,
  },
  amount: {
    type: DataTypes.STRING,
  },
  ticketImageUrl: {
    type: DataTypes.STRING,
  },
});

export const Passenger = sequelize.define("Passenger", {
  travellerType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  givenName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passportNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  issuingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passportImagePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

sequelize.sync({ alter: true });



// Association
// Define associations
FlightBooking.hasMany(Passenger);
Passenger.belongsTo(FlightBooking);
