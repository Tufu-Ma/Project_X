// routes/admin.js
const express = require('express');
const router = express.Router();
const { poolPromise } = require('../config/dbconfig');

router.get('/orders', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT o.OrderId, o.UserId, o.OrderDate, o.TotalAmount, o.ShippingStatus,
                   od.OrderDetailId, od.ProductId, od.Quantity, od.Price, od.SubTotal
            FROM Orders o
            JOIN OrderDetails od ON o.OrderId = od.OrderId
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
