import { User, decodeJWT } from "./user.modal.js";
import { Sequelize, Op } from 'sequelize';
import multer from 'multer'
const filePath = "uploads"
import path from "path";
const __dirname = path.dirname(new URL(import.meta.url).pathname);
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, filePath)
  },
  filename: function (req, file, cb) {
    cb(null, generateID() + '-' + file.originalname)
  }
});

function generateID() {
  return uuidv4().substr(0, 8);
}


// Set up multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, filePath); // Destination folder for uploaded files
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname); // Rename file with timestamp
//   }
// });
  
  const upload = multer({ storage: storage });

export const login = async(req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            throw new Error("Please make sure Username and Password is provided")
        }
        req.body.email = req.body.email.toLowerCase()
        const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegexp.test(req.body.email))
            throw new Error("Please provide a valid Email")
        // Fetch user
        // User.belongsTo(UserType, { targetKey: 'ID', foreignKey: 'UserTypeID' });
        const user = await User.findOne({
            attributes: ['id', 'username', 'password', 'role', 'imagePath', 'email', 'phoneNumber', 'contactPerson', 'isActive'],
            where: {
                email: req.body.email
            },
            // include: {
            //     model: UserType, as: 'UserType',
            //     attributes: ['ID', 'Name']
            // }
        });
        if (!user) {
            throw new Error('We are unaware of such a user');
        }
        // Validate the password
        console.log(user.password, req.body.password, "req.body.password");
        if (await user.password !== req.body.password) {
            throw new Error('Incorrect Login Credentials');
        }
        if (user.isActive == 2) throw new Error('Account has been inactivated!');
      console.log(user.isActive, "user.isActive");
        return res.status(200).json({
            message: 'Welcome back' + ' ' + user.username,
            token: user.generateJWTToken(),
            data: {
                id: user.id, 
                email: user.email,
                profileImg: user.imagePath,
                phoneNumber: user.phoneNumber,
                contactPerson: user.contactPerson,
                dealerName: user.username,
                role: user.role,
                isActive: user.isActive
            },
            success: true,
        })
    }
    catch (error) {
        res.status(200).json({
            message: error.message,
            success: false,
        })
    }
}

export const addUser = async(req, res) => {
    try {
        const payload = decodeJWT(req.headers.authorization);
        if(payload) {
        const {id, dealerName, email, address, phoneNumber, contactPerson, imageUrl, password, role, isActive} = req.body
        if (id) {
          // Check if the user exists
          const existingUser = await User.findByPk(id);

          // Check if email or phone number already exists
        //  const existingUserWithEmail = await User.findOne({ where: { email } });
        //  const existingUserWithPhoneNumber = await User.findOne({ where: { phoneNumber } });

        //  if (existingUserWithEmail) {
        //     return res.status(400).json({
        //         message: 'Email already exists',
        //         success: false,
        //     });
        // }

        // if (existingUserWithPhoneNumber) {
        //     return res.status(400).json({
        //         message: 'Phone number already exists',
        //         success: false,
        //     });
        // } 
  
          if (!existingUser) {
            return res.status(404).json({
              message: 'User not found',
              success: false,
            });
          }
  
          // Update the user's information
          existingUser.username = dealerName || existingUser.username;
          existingUser.email = email || existingUser.email;
          existingUser.address = address || existingUser.address;
          existingUser.phoneNumber = phoneNumber || existingUser.phoneNumber;
          existingUser.contactPerson = contactPerson || existingUser.contactPerson;
          existingUser.imagePath = imageUrl || existingUser.imagePath; // Assuming 'imageUrl' corresponds to 'imagePath' in your model
          existingUser.password = password || existingUser.password;
          existingUser.role = role || existingUser.role;
          existingUser.isActive = isActive || existingUser.isActive;
  
          // Save the updated user
          await existingUser.save();
  
          // Respond with the updated user data
          return res.status(200).json({
            message: 'User updated successfully',
            success: true,
            user: existingUser,
          });
        }
        else {
         // Check if email or phone number already exists
         const existingUserWithEmail = await User.findOne({ where: { email } });
         const existingUserWithPhoneNumber = await User.findOne({ where: { phoneNumber } });

         if (existingUserWithEmail) {
            return res.status(400).json({
                message: 'Email already exists',
                success: false,
            });
        }

        if (existingUserWithPhoneNumber) {
            return res.status(400).json({
                message: 'Phone number already exists',
                success: false,
            });
        } 
        const newUser = await User.create({
            username: dealerName,
            email,
            address,
            phoneNumber,
            contactPerson,
            imagePath: imageUrl, // Assuming 'imageUrl' corresponds to 'imagePath' in your model
            password,
            role,
            isActive
            // Any other fields you want to add to the user record
          });
      
          // Respond with the created user data
          res.status(200).json({ message: 'User created successfully', success: true, user: newUser})
        }
        }
          else {
            return res.status(401).json({
                message: 'Session Expired',
                success: false,
            })
        }
    }
    catch (error) {
        res.status(200).json({
            message: error.message,
            success: false,
        })
    }
}

export const findAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    let whereCondition = {};
    if (search) {
        whereCondition = {
          [Op.or]: [
            {
              username: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              phoneNumber: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              email: {
                [Op.like]: `%${search}%`,
              },
            },
          ],
        };
      }
      

    const offset = (page - 1) * limit;
    const users = await User.findAndCountAll({
      // attributes: { exclude: ['password'] },
      where: whereCondition,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(users.count / limit);
     // Map active status
     const usersWithActiveStatus = users.rows.map(user => ({
      ...user.get(),
      status: user.isActive == 1 ? 'Active' : 'Inactive',
    }));

    res.json({
      users: usersWithActiveStatus,
      totalPages,
      currentPage: parseInt(page),
      totalUsers: users.count,
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const uploadFiles = (req, res) => {
  upload.array('files')(req, res, function (err) {
      if (err) {
        return res.status(500).json({ message: err.message, success: false });
      }
      const files = req.files.map((el) => {
        return {
          path: path.join(__dirname,filePath) + el.filename,
          fileName: el.filename,
        }
      })
      return res.status(200).json({
        message: 'File Uploaded Successfully',
        files: files,
        success: true,
      })
    });
  };

  export const getAllUsers = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['username', 'id', 'role', 'imagePath'],
        order: [['createdAt', 'DESC']],
      });
  
      res.json({
        users: users,
        success: true
      });
      
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };