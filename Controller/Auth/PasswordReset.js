const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const db = require("../../Database/connection");

require("dotenv").config();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.PASSWORD,
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

exports.resetPassword = async (req, res) => {
  const { employee_id } = req.params;

  try {
       // Generate a new password
    const newPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password and reset failed login attempts or forget
    const updateQuery = `
      UPDATE Employees 
      SET password = $1, bad_login_attempts = 0, is_locked = FALSE ,must_change_password = TRUE
      WHERE employee_id = $2 
      RETURNING email, first_name, last_name
    `;
    const updateResult = await db.query(updateQuery, [hashedPassword, employee_id]);

    const updatedEmployee = updateResult.rows[0];

    // Send the new password via email
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: updatedEmployee.email,
      subject: "Password Reset Request - Your New Password",
      html: `
       <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
        padding: 20px;
      }
      
      .header {
        background-color: #007bff;
        color: #fff;
        padding: 20px;
        text-align: center;
      }
      
      .container {
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      
      .logo {
        width: 100px;
        height: 100px;
        object-fit: contain;
        margin: 0 auto;
        display: block;
      }
      
      .signature {
        text-align: left;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <img src="https://st2.depositphotos.com/1768926/7866/v/450/depositphotos_78666192-stock-illustration-a-logo-sample-logo-for.jpg" alt="Company Logo" class="logo">
      <h1>Company Name.</h1>
    </div>
    <div class="container">
      <p>Dear ${updatedEmployee.first_name} ${updatedEmployee.last_name},</p>
      <p>Your account has been reset. Below is your new password:</p>
      <p><strong>New Password: ${newPassword}</strong></p>
      <p>Please log in with this new password and change it immediately for security reasons.</p>
      <p>If you have any questions, feel free to contact us.</p>
      <p class="signature">Best regards,<br>The HR Team</p>
    </div>
  </body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Password reset successfully and new password sent via email.",
      status: "success",
      result: updatedEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error resetting password.", error: error.message });
  }
};
