const express = require("express");
const sql = require("mssql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const JWT_SECRET = "your_jwt_secret";  // เก็บ JWT Secret key

// Register route
router.post("/register", async (req, res) => {
    const { emailOrUsername, password, username, phone, firstName, lastName, gender } = req.body;

    if (!emailOrUsername || !password || !username || !phone || !firstName || !lastName) {
        return res.status(400).send({ error: "All fields except gender are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);  // Hash รหัสผ่าน
        const query = `INSERT INTO Users (Email, Password, Name, Phone, FirstName, LastName, Gender, Role) 
                       VALUES (@Email, @Password, @Name, @Phone, @FirstName, @LastName, @Gender, 'User')`;

        const requestSql = new sql.Request();
        requestSql.input("Email", sql.NVarChar, emailOrUsername);
        requestSql.input("Password", sql.NVarChar, hashedPassword);
        requestSql.input("Name", sql.NVarChar, username);
        requestSql.input("Phone", sql.NVarChar, phone);
        requestSql.input("FirstName", sql.NVarChar, firstName);
        requestSql.input("LastName", sql.NVarChar, lastName);
        requestSql.input("Gender", sql.NVarChar, gender || null);

        await requestSql.query(query);
        res.send({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).send({ error: "Registration failed. Please try again." });
    }
});

// Login route
router.post("/login", async (req, res) => {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
        return res.status(400).send({ error: "Email or username and password are required" });
    }

    try {
        const query = `SELECT * FROM Users WHERE LOWER(Email) = LOWER(@Input) OR LOWER(Name) = LOWER(@Input)`;
        const requestSql = new sql.Request();
        requestSql.input("Input", sql.NVarChar, emailOrUsername);

        const result = await requestSql.query(query);
        const user = result.recordset[0];

        if (!user) {
            return res.status(401).send({ error: "Invalid email or username and password" });
        }

        const validPassword = await bcrypt.compare(password, user.Password);
        if (!validPassword) {
            return res.status(401).send({ error: "Invalid email or username and password" });
        }

        // Create JWT token
        const token = jwt.sign({ id: user.UserId, role: user.Role }, JWT_SECRET, { expiresIn: "1h" });
        res.send({ message: "Login successful", token, role: user.Role });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});

// Reset password route
router.post("/reset-password", async (req, res) => {
    const { email, phone, newPassword } = req.body;

    if ((!email && !phone) || !newPassword) {
        return res.status(400).send({ error: "Email or phone and new password are required" });
    }

    try {
        const query = `SELECT * FROM Users WHERE Email = @Email OR Phone = @Phone`;
        const requestSql = new sql.Request();
        requestSql.input("Email", sql.NVarChar, email || null);
        requestSql.input("Phone", sql.NVarChar, phone || null);

        const result = await requestSql.query(query);
        const user = result.recordset[0];

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updateQuery = `UPDATE Users SET Password = @NewPassword WHERE UserId = @UserId`;
        const updateRequestSql = new sql.Request();
        updateRequestSql.input("NewPassword", sql.NVarChar, hashedNewPassword);
        updateRequestSql.input("UserId", sql.Int, user.UserId);

        await updateRequestSql.query(updateQuery);
        res.send({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Error during password reset:", err);
        res.status(500).send({ error: "Failed to reset password" });
    }
});

module.exports = router;
