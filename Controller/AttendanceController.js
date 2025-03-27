const isWithinGeofence = require('./../Utility/Geofence');
const db = require('../Database/connection');
const { startOfISOWeek , getISOWeek } = require('date-fns');
exports.checkIn = async (req, res) => {
    const { employee_id, latitude, longitude } = req.body;
    try {
        const user = await db.query("SELECT * FROM employees WHERE employee_id = $1", [employee_id]);
        if (!user.rows.length) return res.status(404).json({ message: "User not found." });

        const office = await db.query("SELECT * FROM offices WHERE office_id = $1", [user.rows[0].office_id]);
        if (!office.rows.length) return res.status(404).json({ message: "Office not found." });

        const { latitude: officeLat, longitude: officeLng, radius } = office.rows[0];
         
        // Check if the user is within the office's designated geofence area
        if (!isWithinGeofence(latitude, longitude, officeLat, officeLng, radius)) {
            return res.status(403).json({ message: "You are outside your office's designated area." });
        }

        // Check if the employee is already checked in
        const checkInStatus = await db.query(
            "SELECT * FROM attendancetwo WHERE employee_id = $1 AND is_checked_in = TRUE ORDER BY check_in DESC LIMIT 1", 
            [employee_id]
        );

        if (checkInStatus.rows.length) {
            return res.status(400).json({ message: "You are already checked in." });
        }

        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const checkInTime = hours * 60 + minutes; // Convert to minutes

        const officialCheckIn = 8 * 60; // Official check-in time (8:00 AM)
        const lateThreshold = 8 * 60 + 5; // Late check-in threshold (after 8:05 AM)
        const lunchStart = 12 * 60; // Lunch break start (12:00 PM)
        const lunchEnd = 13 * 60; // Lunch break end (1:00 PM)

        if (checkInTime >= lunchStart && checkInTime < lunchEnd) {
            return res.status(400).json({ message: "Cannot check in during lunch time." });
        }

        let status = "On Time";
        let extraTime = 0;

        // Track extra time if check-in is before 8:00 AM
        if (checkInTime < officialCheckIn) {
            status = "Extra Time";
            extraTime = (officialCheckIn - checkInTime); // Extra time if before 8:00 AM
        } else if (checkInTime > lateThreshold) {
            status = "Late";
        }

        const currentDate = new Date();
        const startOfWeekMonday = startOfISOWeek(currentDate);
        const localMonday = new Date(startOfWeekMonday.getTime() - startOfWeekMonday.getTimezoneOffset() * 60000);
        
        // Fetch the weekly record for the current week
        const weeklyRecord = await db.query(
            "SELECT * FROM weekly_work_hours WHERE employee_id = $1 AND week_start_date = $2",
            [employee_id, localMonday.toISOString().split('T')[0]] // Format as YYYY-MM-DD
        );

        let weeklyExtraHours = 0; // Track extra hours for the week
        let weekNumber = getISOWeek(localMonday);

        if (weeklyRecord?.rows.length) {
            weeklyExtraHours = weeklyRecord.rows[0].extra_work_hours;
            weekNumber = weeklyRecord.rows[0].week_number;
        }

        // Insert check-in record into the attendancetwo table
        await db.query(
            "INSERT INTO attendancetwo (employee_id, office_id, check_in, status, extra_hours, is_checked_in) VALUES ($1, $2, $3, $4, $5, $6)",
            [employee_id, office.rows[0].office_id, now, status, extraTime / 60, true]
        );

        // If it's the start of the week (Monday), initialize the weekly record if it doesn't exist
        if (!weeklyRecord.rows.length) {
            await db.query(
                "INSERT INTO weekly_work_hours (employee_id, week_start_date, week_number, extra_work_hours, status) VALUES ($1, $2, $3, $4, $5)",
                [employee_id, localMonday.toISOString().split('T')[0], weekNumber, extraTime/60, 'In Progress']
            );
        }

        // Update the weekly extra hours for the current week
        await db.query(
            "UPDATE weekly_work_hours SET extra_work_hours = $1 WHERE employee_id = $2 AND week_start_date = $3",
            [weeklyExtraHours + extraTime / 60, employee_id, localMonday.toISOString().split('T')[0]]
        );

        res.json({ message: `Check-in successful! Status: ${status}`, extraTime: extraTime / 60 });
    } catch (error) {
        res.status(500).json({ message: "Error during check-in.", error: error.message });
    }
};

exports.checkOut = async (req, res) => {
    const { employee_id } = req.body;
    const checkOutTime = new Date();
    const checkOutMinutes = checkOutTime.getHours() * 60 + checkOutTime.getMinutes();
    const officialCheckOut = 17 * 60; // 5:00 PM
    const lunchStart = 12 * 60;
    const lunchEnd = 13 * 60;

    try {
        const attendance = await db.query(
            "SELECT * FROM attendancetwo WHERE employee_id = $1 AND is_checked_in = TRUE ORDER BY check_in DESC LIMIT 1",
            [employee_id]
        );

        if (!attendance.rows.length) return res.status(400).json({ message: "No check-in record found." });

        const { check_in, office_id, extra_hours } = attendance.rows[0];
        const checkInTime = new Date(check_in);
        const checkInMinutes = checkInTime.getHours() * 60 + checkInTime.getMinutes();
        
        let totalWorkMinutes = checkOutMinutes - checkInMinutes;
        if (checkInMinutes < lunchEnd && checkOutMinutes > lunchStart) {
            totalWorkMinutes -= (lunchEnd - lunchStart);
        }

        let extraTime = parseFloat(extra_hours) || 0;
        if (checkOutMinutes > officialCheckOut) {
            extraTime += (checkOutMinutes - officialCheckOut) / 60;
        }

        const totalWorkHoursToday = totalWorkMinutes / 60;

   
        const currentDate = new Date();
        const startOfWeekMonday = startOfISOWeek(currentDate);
        const localMonday = new Date(startOfWeekMonday.getTime() - startOfWeekMonday.getTimezoneOffset() * 60000);
        const weekNumber = getISOWeek(localMonday);
        const weeklyRecord = await db.query(
            "SELECT * FROM weekly_work_hours WHERE employee_id = $1 AND week_start_date = $2",
            [employee_id, localMonday.toISOString().split('T')[0]]
        );

        if (!weeklyRecord.rows.length) {
            await db.query(
                "INSERT INTO weekly_work_hours (employee_id, week_start_date, week_number, total_work_hours, extra_work_hours, status) VALUES ($1, $2, $3, $4, $5, 'In Progress')",
                [employee_id, localMonday.toISOString().split('T')[0], weekNumber, 0, 0]
            );
        }

        await db.query(
            "UPDATE weekly_work_hours SET total_work_hours = total_work_hours + $1, extra_work_hours = extra_work_hours + $2 WHERE employee_id = $3 AND week_start_date = $4",
            [totalWorkHoursToday, extraTime, employee_id, localMonday.toISOString().split('T')[0]]
        );

        await db.query(
            "UPDATE attendancetwo SET check_out = $1, extra_hours = $2, is_checked_in = FALSE WHERE employee_id = $3 AND office_id = $4 AND check_in = $5",
            [checkOutTime, extraTime, employee_id, office_id, check_in]
        );

        res.json({ message: "Check-out successful!", totalWorkHours: totalWorkHoursToday, extraHours: extraTime });
    } catch (error) {
        res.status(500).json({ message: "Error during check-out.", error: error.message });
    }
};



exports.getAttendanceRecords = async (req, res) => {
    try {
        const records = await db.query(
            `SELECT a.employee_id, 
                    e.first_name, 
                    e.last_name, 
                    o.name, 
                    a.check_in, 
                    a.check_out, 
                    a.status, 
                    a.is_checked_in,
                    a.extra_hours, 
                    -- Today's total work hours
                    (SELECT SUM(EXTRACT(EPOCH FROM check_out - check_in) / 3600)
                     FROM attendancetwo
                     WHERE employee_id = a.employee_id 
                       AND DATE(check_in) = CURRENT_DATE) AS total_work_hours_today,
                    -- This week's total work hours
                    (SELECT COALESCE(SUM(extra_work_hours), 0)
                     FROM weekly_work_hours
                     WHERE employee_id = a.employee_id 
                       AND week_start_date = date_trunc('week', CURRENT_DATE)::DATE) AS total_work_hours_week,
                    -- Today's extra hours
                    (SELECT COALESCE(SUM(total_work_hours), 0)
                     FROM weekly_work_hours
                     WHERE employee_id = a.employee_id 
                       AND week_start_date = date_trunc('week', CURRENT_DATE)::DATE) AS total_work_hours_week,
                    -- Today's extra hours
                    (SELECT COALESCE(SUM(extra_hours), 0)
                     FROM attendancetwo
                     WHERE employee_id = a.employee_id 
                       AND DATE(check_in) = CURRENT_DATE
                       AND extra_hours > 0) AS extra_hours_today,
                    -- This week's extra hours (from weekly_work_hours table)
                    (SELECT COALESCE(SUM(extra_work_hours), 0)
                     FROM weekly_work_hours
                     WHERE employee_id = a.employee_id 
                       AND week_start_date = date_trunc('week', CURRENT_DATE)::DATE) AS extra_hours_week
             FROM attendancetwo a
             JOIN employees e ON a.employee_id = e.employee_id
             JOIN offices o ON a.office_id = o.office_id
             ORDER BY a.check_in DESC`
        );

        res.json({ message: "Attendance records fetched successfully!", records: records.rows });
    } catch (error) {
        res.status(500).json({ message: "Error fetching attendance records.", error: error.message });
    }
};

exports.getAttendanceRecordsByEmployee = async (req, res) => {
    const { employee_id } = req.params;

    try {
        const records = await db.query(
            `SELECT a.employee_id, 
                    e.first_name, 
                    e.last_name, 
                    o.name AS office_name, 
                    a.check_in, 
                    a.check_out, 
                    a.status, 
                    a.is_checked_in,
                    a.extra_hours, 
                    -- Today's total work hours
                    (SELECT COALESCE(SUM(EXTRACT(EPOCH FROM check_out - check_in) / 3600), 0)
                     FROM attendancetwo
                     WHERE employee_id = a.employee_id 
                       AND DATE(check_in) = CURRENT_DATE) AS total_work_hours_today,
                    -- This week's total work hours
                     (SELECT COALESCE(SUM(total_work_hours), 0)
                     FROM weekly_work_hours
                     WHERE employee_id = a.employee_id 
                       AND week_start_date = date_trunc('week', CURRENT_DATE)::DATE) AS total_work_hours_week,
                    -- Today's extra hours
                    (SELECT COALESCE(SUM(extra_hours), 0)
                     FROM attendancetwo
                     WHERE employee_id = a.employee_id 
                       AND DATE(check_in) = CURRENT_DATE
                       AND extra_hours > 0) AS extra_hours_today,
                    -- This week's extra hours (from weekly_work_hours table)
                    (SELECT COALESCE(SUM(extra_work_hours), 0)
                     FROM weekly_work_hours
                     WHERE employee_id = a.employee_id 
                       AND week_start_date = date_trunc('week', CURRENT_DATE)::DATE) AS extra_hours_week
             FROM attendancetwo a
             JOIN employees e ON a.employee_id = e.employee_id
             JOIN offices o ON a.office_id = o.office_id
             WHERE a.employee_id = $1
             ORDER BY a.check_in DESC`,
            [employee_id]
        );

        if (!records.rows.length) {
            return res.status(404).json({ message: "No attendance records found for this employee." });
        }

        res.json({ message: "Attendance records fetched successfully!", records: records.rows });
    } catch (error) {
        res.status(500).json({ message: "Error fetching attendance records.", error: error.message });
    }
};


exports.getAllWeeklyWorkHours = async (req, res) => {
    try {
        const records = await db.query(
            `SELECT w.week_id, 
                    w.employee_id, 
                    e.first_name, 
                    e.last_name, 
                    w.week_start_date, 
                    w.week_number, 
                    w.total_work_hours, 
                    w.extra_work_hours, 
                    w.status
             FROM weekly_work_hours w
             JOIN employees e ON w.employee_id = e.employee_id
             ORDER BY w.week_start_date DESC`
        );

        if (!records.rows.length) {
            return res.status(404).json({ message: "No weekly work hour records found." });
        }

        res.json({ message: "Weekly work hours fetched successfully!", records: records.rows });
    } catch (error) {
        res.status(500).json({ message: "Error fetching weekly work hours.", error: error.message });
    }
};
exports.getWeeklyWorkHoursByEmployee = async (req, res) => {
    const { employee_id } = req.params;

    try {
        const records = await db.query(
            `SELECT w.week_id, 
                    w.employee_id, 
                    e.first_name, 
                    e.last_name, 
                    w.week_start_date, 
                    w.week_number, 
                    w.total_work_hours, 
                    w.extra_work_hours, 
                    w.status
             FROM weekly_work_hours w
             JOIN employees e ON w.employee_id = e.employee_id
             WHERE w.employee_id = $1
             ORDER BY w.week_start_date DESC`,
            [employee_id]
        );

        if (!records.rows.length) {
            return res.status(404).json({ message: "No weekly work hour records found for this employee." });
        }

        res.json({ message: "Weekly work hours fetched successfully!", records: records.rows });
    } catch (error) {
        res.status(500).json({ message: "Error fetching weekly work hours.", error: error.message });
    }
};
