const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const nodemailer = require("nodemailer");
const validator = require("validator"); 
const db = require("../Database/connection");
require("dotenv").config();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/jpg",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Invalid file type. Only JPEG, JPG, PNG, and GIF are allowed."
        )
      );
    }
    cb(null, true);
  },
});
// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.PASSWORD
  },
});
// Helper function to generate secure passwords
function generateSecurePassword(length = 8) {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const special = "@$!%*?&#";
  const all = lowercase + uppercase + digits + special;

  let password = "";
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return shuffleString(password);
}

function shuffleString(string) {
  const array = string.split("");
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join("");
}
exports.createEmployee =[ upload.single("profile_picture"),
  (err, req, res, next) => {
    if (
      err instanceof multer.MulterError ||
      err.message.includes("Invalid file type")
    ) {
      return res.status(400).json({ message: err.message });
    }
    next();
  },
  async (req, res) => {
    try {
      const {
        first_name,
        last_name,
        email,
        phone,
        department_id,
        role_id,
        date_of_birth,
        address,
        date_joined,
      } = req.body;
      const phoneRegex = /^\+?[0-9]{9,15}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).send({ message: "Invalid phone number format." });
      }
      if (!first_name || !last_name || !email || !phone || !date_joined) {
        return res.status(404).send({ message: "Fields cannot be Empty!" });
      }
      if (!validator.isEmail(email)) {
        return res.status(400).send({ message: "Invalid email address" });
      }
      const profile_picture = req.file ? req.file.buffer : null;
      const password = generateSecurePassword();
      const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO Employees (
                first_name, last_name, email, phone, department_id, role_id,
                date_of_birth, address, date_joined, status, password, profile_picture
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Active', $10, $11) RETURNING *`
      const newEmployee = await db.query(
        query,
        [
          first_name,
          last_name,
          email,
          phone,
          department_id,
          role_id,
          date_of_birth,
          address,
          date_joined,
          hashedPassword,
          profile_picture,
        ]
      );

      const user = newEmployee.rows[0];
      // Send password to the employee's email
      const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: "Welcome to the Company - Your Account Details",
        html: `
           <html>
           <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #2c3e50;
                text-align: center;
              }
              .content {
                font-size: 16px;
                line-height: 1.6;
              }
              .credentials {
                margin-top: 20px;
                padding: 15px;
                background-color: #f2f2f2;
                border-radius: 5px;
                font-weight: bold;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 14px;
                color: #777;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Welcome to the Company!</h1>
              <div class="content">
                <p>Hello ${first_name} ${last_name},</p>
                <p>Welcome to the company! We're excited to have you on board. Below are your login credentials:</p>
                <div class="credentials">
                  <p>Email: <strong>${email}</strong></p>
                  <p>Password: <strong>${password}</strong></p>
                </div>
                <p>Please log in and change your password immediately for security reasons.</p>
                <p><a href="http://localhost:3000"> Click Here<a/></p>
                <p>Best regards,</p>
                <p>The HR Team</p>
              </div>
            </div>
            <div class="footer">
              <p>If you have any questions, feel free to contact us at any time.</p>
            </div>
          </body>
        </html>
      `,
      };

      await transporter.sendMail(mailOptions);

      res.status(201).json({
        message:
          "Employee created successfully and login credentials sent via email.",
        status: "success",
        user,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error creating employee.", error: error.message });
    }
  }];
