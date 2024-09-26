// sales.controller.js (ไฟล์ใหม่)
const { sql, poolPromise } = require('../config/dbconfig');

exports.getSalesData = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { filterType, filterValue } = req.query;

        // Query สำหรับดึงข้อมูลจากฐานข้อมูล
        let query = `
            SELECT 
                p.ProductName,
                SUM(od.Quantity) as TotalSales,
                SUM(od.Price * od.Quantity) as TotalRevenue,
                (SUM(od.Price * od.Quantity) - SUM(p.CostPrice * od.Quantity)) as Profit
            FROM Orders o
            JOIN OrderDetails od ON o.OrderId = od.OrderId
            JOIN Products p ON od.ProductId = p.ProductId
            GROUP BY p.ProductName
        `;

        // ตรวจสอบเงื่อนไขการกรอง
        if (filterType === 'highestPrice') {
            query += ` ORDER BY TotalRevenue DESC`;
        } else if (filterType === 'highestSales') {
            query += ` ORDER BY TotalSales DESC`;
        } else if (filterType === 'topProduct') {
            query += ` WHERE p.ProductName = '${filterValue}'`;
        }

        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
};
