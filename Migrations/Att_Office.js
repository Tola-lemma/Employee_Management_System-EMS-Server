const Offices = `CREATE TABLE IF NOT EXISTS  offices (
    office_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    radius INT DEFAULT 150 -- Geo-fence radius in meters
)`
module.exports = Offices