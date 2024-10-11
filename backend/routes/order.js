const express = require('express');
const sql = require('mssql');
const router = express.Router();
const checkConnection = require('../utils/db'); // นำเข้า connection database

// สร้าง order ใหม่
router.post('/', async (req, res) => {
    const { UserId, TotalAmount, OrderStatus } = req.body;

    // ตรวจสอบว่าข้อมูลที่จำเป็นถูกส่งมา
    if (!UserId || !TotalAmount) {
        return res.status(400).json({ message: 'UserId and TotalAmount are required' });
    }

    try {
        const pool = await checkConnection();
        const result = await pool.request()
            .input('UserId', sql.Int, UserId)
            .input('TotalAmount', sql.Decimal(10, 2), TotalAmount)
            .input('OrderStatus', sql.NVarChar(50), OrderStatus || 'Pending')
            .query(`INSERT INTO Orders (UserId, TotalAmount, OrderStatus, CreatedDate) 
                    VALUES (@UserId, @TotalAmount, @OrderStatus, GETDATE()); 
                    SELECT SCOPE_IDENTITY() AS OrderId;`);
        
        const orderId = result.recordset[0].OrderId;
        res.status(201).json({ message: 'Order created successfully', OrderId: orderId });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Error creating order' });
    }
});

// รับข้อมูล order ทั้งหมด หรือคำสั่งซื้อตาม UserId
router.get('/', async (req, res) => {
    const userId = req.query.userId; // รับ userId จาก query

    try {
        const pool = await checkConnection();
        let query = 'SELECT * FROM Orders';
        let request = pool.request();

        // ตรวจสอบว่ามี userId หรือไม่
        if (userId) {
            query += ' WHERE UserId = @UserId';
            request = request.input('UserId', sql.Int, userId);
        }

        const result = await request.query(query);
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// รับข้อมูล order ตาม ID
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);

    // ตรวจสอบว่า id เป็นจำนวนเต็มหรือไม่
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid Order ID' });
    }

    try {
        const pool = await checkConnection();
        const result = await pool.request()
            .input('OrderId', sql.Int, id)
            .query('SELECT * FROM Orders WHERE OrderId = @OrderId');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ message: 'Error fetching order' });
    }
});

// อัปเดตสถานะ order
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { OrderStatus } = req.body;

    // ตรวจสอบว่ามีการส่งสถานะมา
    if (!OrderStatus) {
        return res.status(400).json({ message: 'OrderStatus is required' });
    }

    try {
        const pool = await checkConnection();
        await pool.request()
            .input('OrderId', sql.Int, id)
            .input('OrderStatus', sql.NVarChar(50), OrderStatus)
            .query(`UPDATE Orders 
                    SET OrderStatus = @OrderStatus, UpdatedDate = GETDATE() 
                    WHERE OrderId = @OrderId`);
        
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ message: 'Error updating order' });
    }
});

// ลบ order ตาม ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await checkConnection();
        
        // ตรวจสอบว่ามี Order อยู่จริงก่อนลบ
        const checkResult = await pool.request()
            .input('OrderId', sql.Int, id)
            .query('SELECT * FROM Orders WHERE OrderId = @OrderId');

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await pool.request()
            .input('OrderId', sql.Int, id)
            .query('DELETE FROM Orders WHERE OrderId = @OrderId');

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ message: 'Error deleting order' });
    }
});
// Route สำหรับกรองสินค้าตามหมวดหมู่ที่ใช้งาน
router.get('/category/:categoryId', (req, res) => {
    const categoryId = req.params.categoryId;
    
    const query = `
      SELECT p.* FROM Products p
      JOIN Categories c ON p.CategoryId = c.CategoryId
      WHERE p.CategoryId = @CategoryId AND c.Status = 'Active'
    `;
    
    const requestSql = new sql.Request();
    requestSql.input('CategoryId', sql.Int, categoryId);
  
    requestSql.query(query, (err, result) => {
      if (err) {
        console.error('Error fetching products by category:', err);
        return res.status(500).send({ error: 'Internal server error' });
      }
      res.send(result.recordset);
    });
  });
  
module.exports = router;
