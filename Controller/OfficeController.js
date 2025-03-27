const db = require("../Database/connection");

exports.createOffice = async (req, res) => {
    const { name, latitude, longitude, radius } = req.body;

    if (!name || !latitude || !longitude) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const query = `INSERT INTO offices (name, latitude, longitude, radius) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await db.query(query, [name, latitude, longitude, radius || 100]);
        res.status(201).json({ message: "Office created successfully!", office: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: "Error creating office.", error: error.message });
    }
};

exports.getOffices = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM offices");
        res.status(200).json({ offices: result.rows });
    } catch (error) {
        res.status(500).json({ message: "Error fetching offices.", error: error.message });
    }
};


exports.updateOffice = async (req, res) => {
    const { office_id } = req.params; // Get office ID from the URL params
    const { name, latitude, longitude, radius } = req.body;

    if (!office_id || (!name && !latitude && !longitude && !radius)) {
        return res.status(400).json({ message: "At least one field must be provided to update." });
    }

    // Building the SET clause dynamically based on the fields that are provided
    let setClause = [];
    let values = [];
    let counter = 1;

    if (name) {
        setClause.push(`name = $${counter}`);
        values.push(name);
        counter++;
    }
    if (latitude) {
        setClause.push(`latitude = $${counter}`);
        values.push(latitude);
        counter++;
    }
    if (longitude) {
        setClause.push(`longitude = $${counter}`);
        values.push(longitude);
        counter++;
    }
    if (radius) {
        setClause.push(`radius = $${counter}`);
        values.push(radius);
        counter++;
    }

    // If no fields were provided, return a bad request response
    if (setClause.length === 0) {
        return res.status(400).json({ message: "No valid fields to update." });
    }

    // Construct the query
    const query = `
        UPDATE offices
        SET ${setClause.join(", ")}
        WHERE office_id = $${counter}
        RETURNING *;
    `;
    values.push(office_id); // Add the ID value to the parameters for the WHERE clause

    try {
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Office not found." });
        }
        res.status(200).json({ message: "Office updated successfully!", office: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: "Error updating office.", error: error.message });
    }
};
