const db = require("../Database/connection");
//create role
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

//get all roles or a specific role
exports.getRoles = async (req, res) => {
      const { role_id } = req.params; // Optional role_id parameter for fetching a specific role
      try {
        let query = "SELECT * FROM Roles";
        let values = [];
    
        if (role_id) {
          query += " WHERE role_id = $1";
          values = [role_id];
        }
    
        const roles = await db.query(query, values);
        if (role_id && roles.rows.length === 0) {
          return res.status(404).send({ message: "Role not found." });
        }
    
        res.status(200).json({
          message: "Roles fetched successfully!",
          status: "success",
          result: roles.rows,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching roles.", error: error.message });
      }
    };
    
//update role
exports.updateRole = async (req, res) => {
      const { role_id } = req.params;
      const { role_name } = req.body;
    
      try {
        if (!role_name) {
          return res.status(400).send({ message: "Role name cannot be empty." });
        }
    
        const query = `UPDATE Roles SET role_name = $1 WHERE role_id = $2 RETURNING *`;
        const updatedRole = await db.query(query, [role_name, role_id]);
    
        if (updatedRole.rows.length === 0) {
          return res.status(404).send({ message: "Role not found." });
        }
    
        res.status(200).json({
          message: "Role updated successfully!",
          status: "success",
          result: updatedRole.rows[0],
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating role.", error: error.message });
      }
    };

    //delete role
    exports.deleteRole = async (req, res) => {
      const { role_id } = req.params;
    
      try {
        const query = `DELETE FROM Roles WHERE role_id = $1 RETURNING *`;
        const deletedRole = await db.query(query, [role_id]);
    
        if (deletedRole.rows.length === 0) {
          return res.status(404).send({ message: "Role not found." });
        }
    
        res.status(200).json({
          message: "Role deleted successfully!",
          status: "success",
          result: deletedRole.rows[0],
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting role.", error: error.message });
      }
    };
    
