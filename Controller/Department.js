const db = require("../Database/connection");
//create
exports.createDepartment = async(req, res)=>{
const {department_name} = req.body
try {
      if(!department_name){
            return res.status(404).send({ message: "Fields cannot be Empty!" });
      } 
      const query = `INSERT INTO Departments (department_name) VALUES($1) RETURNING *`
      const department = await  db.query(query,[department_name])
      const result = department.rows[0];
      res.status(201).json({
            message: 'Department created successfully!.',
            status:"success",
            result
    }
);
} catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating Department.', error: error.message });
}

}
//read
exports.getDepartments = async (req, res) => {
      const { department_id } = req.params; // Optional ID parameter for fetching a specific department
      try {
        let query = "SELECT * FROM Departments";
        let values = [];
    
        if (department_id) {
          query += " WHERE department_id = $1";
          values = [department_id];
        }
    
        const departments = await db.query(query, values);
        if (department_id && departments.rows.length === 0) {
          return res.status(404).send({ message: "Department not found." });
        }
    
        res.status(200).json({
          message: "Departments fetched successfully!",
          status: "success",
          result: departments.rows,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching departments.", error: error.message });
      }
    };
    
//update
exports.updateDepartment = async (req, res) => {
      const { department_id } = req.params;
      const { department_name } = req.body;
    
      try {
        if (!department_name) {
          return res.status(400).send({ message: "Department name cannot be empty." });
        }
    
        const query = `UPDATE Departments SET department_name = $1 WHERE department_id = $2 RETURNING *`;
        const updatedDepartment = await db.query(query, [department_name, department_id]);
    
        if (updatedDepartment.rows.length === 0) {
          return res.status(404).send({ message: "Department not found." });
        }
    
        res.status(200).json({
          message: "Department updated successfully!",
          status: "success",
          result: updatedDepartment.rows[0],
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating department.", error: error.message });
      }
    };
    //delete
    exports.deleteDepartment = async (req, res) => {
      const { department_id } = req.params;
    
      try {
        const query = `DELETE FROM Departments WHERE department_id = $1 RETURNING *`;
        const deletedDepartment = await db.query(query, [department_id]);
    
        if (deletedDepartment.rows.length === 0) {
          return res.status(404).send({ message: "Department not found." });
        }
    
        res.status(200).json({
          message: "Department deleted successfully!",
          status: "success",
          result: deletedDepartment.rows[0],
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting department.", error: error.message });
      }
    };
    
