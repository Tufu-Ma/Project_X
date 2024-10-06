const express = require('express');
const router = express.Router();
const checkConnection = require('../utils/db'); // เชื่อมต่อกับฐานข้อมูล

// ดึงข้อมูลจากตาราง OrderItems ทั้งหมด
router.get('/order-items', async (req, res) => {
  try {
    const pool = await checkConnection();  // ใช้การเชื่อมต่อฐานข้อมูล
    const result = await pool.request().query('SELECT * FROM OrderItems');
    res.json(result.recordset);  // ส่งข้อมูลในรูปแบบ JSON กลับไปให้ client
  } catch (err) {
    console.error('Error fetching order items:', err);
    res.status(500).json({ message: 'Error fetching order items', error: err.message });
  }
});

// ดึงข้อมูลสินค้าที่ขายดีที่สุดจากตาราง OrderItems
router.get('/best-selling-products', async (req, res) => {
  try {
    const pool = await checkConnection();
    const result = await pool.request().query(`
      SELECT TOP 5 OI.ProductId, P.ProductName, SUM(OI.Quantity) as TotalQuantity, SUM(OI.TotalAmount) as TotalSales
      FROM OrderItems OI
      JOIN Products P ON OI.ProductId = P.ProductId
      GROUP BY OI.ProductId, P.ProductName
      ORDER BY SUM(OI.Quantity) DESC
    `);  // ดึงข้อมูลสินค้าที่มียอดขายสูงสุด
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching best selling products:', err);
    res.status(500).json({ message: 'Error fetching best selling products', error: err.message });
  }
});

// ดึงข้อมูลสินค้าที่ขายได้น้อยที่สุดจากตาราง OrderItems
router.get('/worst-selling-products', async (req, res) => {
  try {
    const pool = await checkConnection();
    const result = await pool.request().query(`
      SELECT TOP 5 OI.ProductId, P.ProductName, SUM(OI.Quantity) as TotalQuantity, SUM(OI.TotalAmount) as TotalSales
      FROM OrderItems OI
      JOIN Products P ON OI.ProductId = P.ProductId
      GROUP BY OI.ProductId, P.ProductName
      ORDER BY SUM(OI.Quantity) ASC
    `);  // ดึงข้อมูลสินค้าที่มียอดขายต่ำสุด
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching worst selling products:', err);
    res.status(500).json({ message: 'Error fetching worst selling products', error: err.message });
  }
});

module.exports = router;
