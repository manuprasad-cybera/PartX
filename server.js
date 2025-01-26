// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Sequelize, DataTypes } = require('sequelize');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Initialize Sequelize for database connection
const sequelize = new Sequelize('PartX', 'root', 'Root@123', {
  host: 'localhost',
  dialect: 'mysql',
});

// Define User model
const User = sequelize.define('User', {
  Id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  Full_Name: { type: DataTypes.STRING, allowNull: false },
  Phone_Number: { type: DataTypes.STRING, allowNull: false, unique: true },
  Email: { type: DataTypes.STRING, allowNull: false, unique: true },
  Country: { type: DataTypes.STRING },
  Area: { type: DataTypes.STRING },
  Otp: { type: DataTypes.STRING },
}, {
  timestamps: false,
});

// Define Vendor model
const Vendor = sequelize.define('Vendor', {
  Id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  Vender_Name: { type: DataTypes.STRING, allowNull: false },
  Vender_Type: { type: DataTypes.STRING },
  License_No: { type: DataTypes.STRING },
  Speciality: { type: DataTypes.STRING },
  License_expire_date: { type: DataTypes.DATE },
  Vender_logo: { type: DataTypes.STRING },
  Phone_Number: { type: DataTypes.STRING, allowNull: false, unique: true },
  Email: { type: DataTypes.STRING, allowNull: false, unique: true },
  Country: { type: DataTypes.STRING },
  Area: { type: DataTypes.STRING },
  Otp: { type: DataTypes.STRING },
}, {
  timestamps: false,
});

// Sync database
sequelize.sync().then(() => {
  console.log('Database synced');
});

// Utility function to generate OTP
const generateOtp = () => crypto.randomInt(1000, 9999).toString();

// Register User
app.post('/register/user', async (req, res) => {
  const { Full_Name, Phone_Number, Email, Country, Area } = req.body;
  try {
    const Otp = generateOtp();
    const user = await User.create({ Full_Name, Phone_Number, Email, Country, Area, Otp });
    res.status(201).json({ message: 'User registered successfully', Otp });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Register Vendor
app.post('/register/vendor', async (req, res) => {
  const { Vender_Name, Vender_Type, License_No, Speciality, License_expire_date, Vender_logo, Phone_Number, Email, Country, Area } = req.body;
  try {
    const Otp = generateOtp();
    const vendor = await Vendor.create({ Vender_Name, Vender_Type, License_No, Speciality, License_expire_date, Vender_logo, Phone_Number, Email, Country, Area, Otp });
    res.status(201).json({ message: 'Vendor registered successfully', Otp });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login User
app.post('/login/user', async (req, res) => {
  const { Phone_Number, Otp } = req.body;
  try {
    const user = await User.findOne({ where: { Phone_Number, Otp } });
    if (!user) return res.status(401).json({ message: 'Invalid OTP or Phone Number' });

    const token = jwt.sign({ id: user.Id, role: 'user' }, 'secretKey', { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login Vendor
app.post('/login/vendor', async (req, res) => {
  const { Phone_Number, Otp } = req.body;
  try {
    const vendor = await Vendor.findOne({ where: { Phone_Number, Otp } });
    if (!vendor) return res.status(401).json({ message: 'Invalid OTP or Phone Number' });

    const token = jwt.sign({ id: vendor.Id, role: 'vendor' }, 'secretKey', { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Dashboard
app.get('/dashboard', (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'Token required' });

  try {
    const decoded = jwt.verify(token, 'secretKey');
    res.json({ message: `Welcome to the dashboard, ${decoded.role}` });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/users', async (req, res) => {
  res.send("sucess");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
