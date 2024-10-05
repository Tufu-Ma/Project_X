const express = require('express');
const sql = require('mssql');
const router = express.Router();
const checkConnection = require('../utils/db'); // นำเข้า connection database

// สร้าง order ใหม่
router.post('/orders', async (req, res) => {
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
            .query(`INSERT INTO Orders (UserId, TotalAmount, OrderStatus) 
                    VALUES (@UserId, @TotalAmount, @OrderStatus); 
                    SELECT SCOPE_IDENTITY() AS OrderId;`);
        
        const orderId = result.recordset[0].OrderId;
        res.status(201).json({ message: 'Order created successfully', OrderId: orderId });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Error creating order' });
    }
});

// รับข้อมูล order ทั้งหมด หรือคำสั่งซื้อตาม UserId
router.get('/orders', async (req, res) => {
    const userId = req.query.userId; // รับ userId จาก query

    try {
        const pool = await checkConnection();
        let result;

        // ตรวจสอบว่ามี userId หรือไม่
        if (userId) {
            // ถ้ามี userId ให้กรองคำสั่งซื้อเฉพาะของผู้ใช้
            result = await pool.request()
                .input('UserId', sql.Int, userId)
                .query('SELECT * FROM Orders WHERE UserId = @UserId');
        } else {
            // ถ้าไม่มี userId ให้ดึงคำสั่งซื้อทั้งหมด
            result = await pool.request().query('SELECT * FROM Orders');
        }

        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// รับข้อมูล order ตาม ID
router.get('/orders/:id', async (req, res) => {
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
router.put('/orders/:id', async (req, res) => {
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
router.delete('/orders/:id', async (req, res) => {
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

module.exports = router;
