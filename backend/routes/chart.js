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
      JOIN Orders O ON OI.OrderId = O.OrderId
      WHERE O.OrderStatus != 'Cancelled'  -- กรองคำสั่งซื้อที่ยกเลิก
      GROUP BY OI.ProductId, P.ProductName
      ORDER BY SUM(OI.Quantity) DESC
    `);
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
      JOIN Orders O ON OI.OrderId = O.OrderId
      WHERE O.OrderStatus != 'Cancelled'  -- กรองคำสั่งซื้อที่ยกเลิก
      GROUP BY OI.ProductId, P.ProductName
      ORDER BY SUM(OI.Quantity) ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching worst selling products:', err);
    res.status(500).json({ message: 'Error fetching worst selling products', error: err.message });
  }
});

router.get('/sales-summary', async (req, res) => {
  try {
    const pool = await checkConnection();
    const result = await pool.request().query(`
      SELECT CAST(O.OrderDate AS DATE) AS date, SUM(OI.TotalAmount) AS total
      FROM OrderItems OI
      JOIN Orders O ON OI.OrderId = O.OrderId
      WHERE O.OrderStatus != 'Cancelled'  -- กรองคำสั่งซื้อที่ยกเลิก
      GROUP BY CAST(O.OrderDate AS DATE)
      ORDER BY date
    `);

    const totalSales = result.recordset.reduce((sum, item) => sum + item.total, 0);
    res.json({ totalSales, sales: result.recordset }); // ส่งยอดขายรวมและข้อมูลยอดขายตามวัน
  } catch (err) {
    console.error('Error fetching sales summary:', err);
    res.status(500).json({ message: 'Error fetching sales summary', error: err.message });
  }
});

  

module.exports = router;
