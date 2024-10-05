const express = require('express');
const router = express.Router();
const sql = require('mssql'); // เชื่อมต่อกับ SQL Server

// Endpoint สำหรับดึงข้อมูลยอดขาย
router.get('/sales', async (req, res) => {
    try {
        const pool = await sql.connect(/* ข้อมูลการเชื่อมต่อกับ SQL Server */);
        const result = await pool.request().query(`
            SELECT 
                O.OrderDate, 
                P.ProductName, 
                OD.Quantity, 
                (OD.Quantity * OD.Price) AS TotalPrice
            FROM Orders O
            JOIN OrderDetails OD ON O.OrderId = OD.OrderId
            JOIN Products P ON OD.ProductId = P.ProductId
            ORDER BY O.OrderDate DESC
        `);

        res.status(200).json(result.recordset);  // ส่งข้อมูลยอดขายกลับไปยัง frontend
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ message: 'Error fetching sales data' });
    }
});

module.exports = router;
