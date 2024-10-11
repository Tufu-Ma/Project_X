const express = require('express');
const sql = require('mssql');
const checkConnection = require('./db'); // import database connection

const router = express.Router();

// API เพื่อดึงข้อมูลคำสั่งซื้อทั้งหมด
router.get('/orders', async (req, res) => {
    try {
        const pool = await checkConnection();
        const result = await pool.request().query('SELECT * FROM Orders');
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching orders');
    }
});

// API สำหรับอัพเดตสถานะคำสั่งซื้อ
router.put('/orders/:orderId/status', async (req, res) => {
    const { orderId } = req.params;
    const { newStatus, changedBy } = req.body;

    if (!newStatus || !changedBy) {
        return res.status(400).send('New status and changedBy are required.');
    }

    try {
        const pool = await checkConnection();

        // ดึงสถานะก่อนหน้า
        const previousStatusResult = await pool.request()
            .input('OrderId', sql.Int, orderId)
            .query('SELECT TOP 1 NewStatus FROM OrderStatusHistory WHERE OrderId = @OrderId ORDER BY StatusChangeDate DESC');

        const previousStatus = previousStatusResult.recordset.length > 0 ? previousStatusResult.recordset[0].NewStatus : 'Unknown';

        // อัพเดตสถานะใหม่ใน OrderStatusHistory
        await pool.request()
            .input('OrderId', sql.Int, orderId)
            .input('PreviousStatus', sql.NVarChar, previousStatus)
            .input('NewStatus', sql.NVarChar, newStatus)
            .input('ChangedBy', sql.NVarChar, changedBy)
            .input('StatusChangeDate', sql.DateTime, new Date())
            .query(`
                INSERT INTO OrderStatusHistory (OrderId, PreviousStatus, NewStatus, StatusChangeDate, ChangedBy)
                VALUES (@OrderId, @PreviousStatus, @NewStatus, @StatusChangeDate, @ChangedBy)
            `);

        res.status(200).send('Order status updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating order status');
    }
});

module.exports = router;
