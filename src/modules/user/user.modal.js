import { Sequelize, DataTypes } from 'sequelize';
import * as path from 'path';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

// // Get the current module's file path

// Database configuration
export const sequelize = new Sequelize('harizon_travels', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JWT Keys
const RSA_PRIVATE_KEY = fs.readFileSync(path.join(__dirname, './../../../keys/jwt-private.key'))
const RSA_PUBLIC_KEY = fs.readFileSync(path.join(__dirname, './../../../keys/jwt-public.pub'));




  // (async () => {
  //   try {
  //     await sequelize.authenticate();
  //     console.log('Connection to the database has been established successfully.');
  //   } catch (error) {
  //     console.error('Unable to connect to the database:', error);
  //   }
  // })();
  
  // model for User
  export const User = sequelize.define('User', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    imagePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
  },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contactPerson: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
  },
  });
  
  User.prototype.generateJWTToken =  function()  {
    const options = {
      algorithm: 'RS256',
      expiresIn: 6000000,
      subject: this.email
    },
      payload = {
        name: this.username,
        email: this.email,
        role: this.role,
        phoneNumber: this.phoneNumber,
        id: this.id,
        imagePath: this.imagePath,
        role: this.role
      };
    return jwt.sign(payload, RSA_PRIVATE_KEY, options);
  };
  
  User.prototype.validatePassword = function (password) {
    return bcrypt.compare(password, RSA_PRIVATE_KEY, this.password); // ASYNC
  };

  export const decodeJWT = (header) => {
    if (header || typeof header === 'string'){
    const token = header.replace('Bearer ', '');
    return jwt.verify(token, RSA_PUBLIC_KEY, (err, decoded) => {
      if (err) {
        return false;
      }
      return (decoded);
    }
    )
  }
  else return false
  };


