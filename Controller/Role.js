const db = require("../Database/connection");

exports.createRole = async(req, res)=>{
const {role_name} = req.body
try {
      if(!role_name){
            return res.status(404).send({ message: "Fields cannot be Empty!" });
      }
      const query =`INSERT INTO Roles (role_name) VALUES($1) RETURNING *`
      const role = await  db.query(query,[role_name])
      const result = role.rows[0];
      res.status(201).json({
            message: 'Role created successfully!.',
            status:"success",
            result
    }
);
} catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating Role.', error: error.message });
}

}