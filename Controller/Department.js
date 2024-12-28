const db = require("../Database/connection");

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