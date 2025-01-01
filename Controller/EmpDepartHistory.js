const db = require("../Database/connection");
exports.getEmployeeDepartmentHistory = async (req, res) => {
      const { employee_id } = req.params;
    
      try {
        const query = `
SELECT h.history_id,d.department_name,
    TO_CHAR(h.start_date, 'DD/MM/YYYY') AS start_date,
    TO_CHAR(h.end_date, 'DD/MM/YYYY') AS end_date,
    CONCAT(
        CASE 
            WHEN EXTRACT(YEAR FROM AGE(h.end_date, h.start_date)) > 0 THEN 
                EXTRACT(YEAR FROM AGE(h.end_date, h.start_date))::INT || ' year' || 
                CASE WHEN EXTRACT(YEAR FROM AGE(h.end_date, h.start_date)) > 1 THEN 's' ELSE '' END || ', ' 
            ELSE '' 
        END,
        CASE 
            WHEN EXTRACT(MONTH FROM AGE(h.end_date, h.start_date)) > 0 THEN 
                EXTRACT(MONTH FROM AGE(h.end_date, h.start_date))::INT || ' month' || 
                CASE WHEN EXTRACT(MONTH FROM AGE(h.end_date, h.start_date)) > 1 THEN 's' ELSE '' END || ', ' 
            ELSE '' 
        END,
        CASE 
            WHEN EXTRACT(DAY FROM AGE(h.end_date, h.start_date)) > 0 THEN 
                EXTRACT(DAY FROM AGE(h.end_date, h.start_date))::INT || ' day' || 
                CASE WHEN EXTRACT(DAY FROM AGE(h.end_date, h.start_date)) > 1 THEN 's' ELSE '' END 
            ELSE '' 
        END
    ) AS duration
          FROM EmployeeDepartmentHistory h
          LEFT JOIN Departments d ON h.department_id = d.department_id
          WHERE h.employee_id = $1
          ORDER BY h.start_date DESC;
        `;
        const result = await db.query(query, [employee_id]);
      //   const departHist = result.rows.map(department => ({
      //       ...department,
      //       end_date: new Date(department.end_date).toLocaleDateString("en-GB"),
      //       start_date: new Date(department.start_date).toLocaleDateString("en-GB"),
      //     }));
        if (result.rows.length === 0) {
          return res.status(404).send({ message: "No department history found for this employee." });
        }
    
        res.status(200).json({
          message: "Employee department history retrieved successfully!",
          status: "success",
          result: result.rows,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving department history.", error: error.message });
      }
    };
    
