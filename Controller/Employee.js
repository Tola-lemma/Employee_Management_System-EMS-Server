const bcrypt = require("bcrypt");
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
                 .header {
                      background-color: #007bff;
                      color: #fff;
                      padding: 20px;
                      text-align: center;
                    }
                  .logo {
                      width: 100px;
                      height: 100px;
                      object-fit: contain;
                      margin: 0 auto;
                      display: block;
                    }
            </style>
          </head>
          <body>
          <div class="header">
              <img src="https://st2.depositphotos.com/1768926/7866/v/450/depositphotos_78666192-stock-illustration-a-logo-sample-logo-for.jpg" alt="Company Logo" class="logo">
              <h1>Company Name.</h1>
           </div>
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
//get all employees or a specific employee
exports.getEmployee = async (req, res) => {
  const { employee_id } = req.params;

  try {
    const query = `
      SELECT e.employee_id, e.first_name, e.last_name, e.email, e.phone, 
             e.date_of_birth, e.address, e.date_joined, e.status,e.profile_picture, 
             d.department_name as department, r.role_name as role, e.role_id, e.department_id
      FROM Employees e
      LEFT JOIN Departments d ON e.department_id = d.department_id
      LEFT JOIN Roles r ON e.role_id = r.role_id
      ${employee_id ? "WHERE e.employee_id = $1" : ""}`;
    
    const values = employee_id ? [employee_id] : [];

    const result = await db.query(query, values);

    if (employee_id && result.rows.length === 0) {
      return res.status(404).send({ message: "Employee not found." });
    }
    //date format
    const employees = result.rows.map(employee => ({
      ...employee,
      date_joined: new Date(employee.date_joined).toLocaleDateString("en-GB"),
      date_of_birth: new Date(employee.date_of_birth).toLocaleDateString("en-GB"),
    }));
    res.status(200).json({
      message: employee_id
        ? "Employee retrieved successfully!"
        : "All employees retrieved successfully!",
      status: "success",
      result: employee_id ? result.rows[0] : employees,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving employee(s).", error: error.message });
  }
};


//update employee
exports.updateEmployee = async (req, res) => {
  const { employee_id } = req.params;
  const updateFields = req.body; // Get only fields sent in the request body

  try {
    if (!employee_id) {
      return res.status(400).send({ message: "Employee ID is required." });
    }

    // Build the dynamic UPDATE query
    const setClauses = [];
    const values = [];

    let index = 1; // Start positional parameters at $1
    for (const [field, value] of Object.entries(updateFields)) {
      setClauses.push(`${field} = $${index}`);
      values.push(value);
      index++;
    }

    if (setClauses.length === 0) {
      return res.status(400).send({ message: "No fields to update provided." });
    }

    const query = `
      UPDATE Employees
      SET ${setClauses.join(", ")}
      WHERE employee_id = $${index}
      RETURNING *`;

    values.push(employee_id); // Add employee_id as the last parameter

     // Check if the `department_id` is being updated
     const currentDepartmentQuery = `
     SELECT department_id, date_joined FROM Employees WHERE employee_id = $1
   `;
   const currentDepartmentResult = await db.query(currentDepartmentQuery, [employee_id]);

   if (currentDepartmentResult.rows.length === 0) {
     return res.status(404).send({ message: "Employee not found." });
   }

   const currentDepartment = currentDepartmentResult.rows[0].department_id;
   const dateJoined = currentDepartmentResult.rows[0].date_joined;
   const newDepartmentId = updateFields.department_id;

   const updatedEmployee = await db.query(query, values);

   if (updatedEmployee.rows.length === 0) {
     return res.status(404).send({ message: "Employee not found." });
   }

   // If `department_id` has changed, update the history
   if (newDepartmentId && newDepartmentId !== currentDepartment) {
     const today = new Date().toISOString().split("T")[0];

     // Log the new department assignment
     const logHistoryQuery = `
       INSERT INTO EmployeeDepartmentHistory (employee_id, department_id, start_date)
       VALUES ($1, $2, $3);
     `;
     await db.query(logHistoryQuery, [employee_id, currentDepartment, dateJoined]);

     // End the previous department assignment
     const endHistoryQuery = `
       UPDATE EmployeeDepartmentHistory
       SET end_date = $1
       WHERE employee_id = $2 AND department_id = $3 AND end_date IS NULL;
     `;
     await db.query(endHistoryQuery, [today, employee_id, currentDepartment]);
   }

    res.status(200).json({
      message: "Employee updated successfully!",
      status: "success",
      result: updatedEmployee.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating employee.", error: error.message });
  }
};


  //delete employee
  exports.deleteEmployee = async (req, res) => {
    const { employee_id } = req.params;
  
    try {
      if (!employee_id) {
        return res.status(400).send({ message: "Employee ID is required." });
      }
  
      const query = "DELETE FROM Employees WHERE employee_id = $1 RETURNING *";
      const deletedEmployee = await db.query(query, [employee_id]);
  
      if (deletedEmployee.rows.length === 0) {
        return res.status(404).send({ message: "Employee not found." });
      }
  
      res.status(200).json({
        message: "Employee deleted successfully!",
        status: "success",
        result: deletedEmployee.rows[0],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting employee.", error: error.message });
    }
  };
  