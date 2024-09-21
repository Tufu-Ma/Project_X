const express = require('express');
const sql = require('mssql');
const router = express.Router();

// Route สำหรับเพิ่มสินค้าลงในรถเข็น
router.post('/cart', (req, res) => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
        return res.status(400).send({ error: "UserId, ProductId, and quantity are required" });
    }

    const query = `INSERT INTO Cart (UserId, ProductId, Quantity) VALUES (@UserId, @ProductId, @Quantity)`;
    const requestSql = new sql.Request();
    requestSql.input("UserId", sql.Int, userId);
    requestSql.input("ProductId", sql.Int, productId);
    requestSql.input("Quantity", sql.Int, quantity);

    requestSql.query(query, (err, result) => {
        if (err) {
            console.error("Error adding to cart:", err);
            return res.status(500).send({ error: "Internal server error" });
        }
        res.send({ message: "Product added to cart successfully" });
    });
});

// Route สำหรับดึงข้อมูลรถเข็นของผู้ใช้
router.get('/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `SELECT * FROM Cart WHERE UserId = @UserId`;
    const requestSql = new sql.Request();
    requestSql.input("UserId", sql.Int, userId);

    requestSql.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching cart items:", err);
            return res.status(500).send({ error: "Internal server error" });
        }
        res.send(result.recordset);
    });
});

// Route สำหรับอัปเดตจำนวนสินค้าในรถเข็น
router.put('/cart/:id', (req, res) => {
    const cartId = req.params.id;
    const { quantity } = req.body;

    if (!quantity) {
        return res.status(400).send({ error: "Quantity is required" });
    }

    const query = `UPDATE Cart SET Quantity = @Quantity WHERE CartId = @CartId`;
    const requestSql = new sql.Request();
    requestSql.input("Quantity", sql.Int, quantity);
    requestSql.input("CartId", sql.Int, cartId);

    requestSql.query(query, (err, result) => {
        if (err) {
            console.error("Error updating cart:", err);
            return res.status(500).send({ error: "Internal server error" });
        }
        res.send({ message: "Cart updated successfully" });
    });
});

// Route สำหรับลบสินค้าจากรถเข็น
router.delete('/cart/:id', (req, res) => {
    const cartId = req.params.id;

    const query = `DELETE FROM Cart WHERE CartId = @CartId`;
    const requestSql = new sql.Request();
    requestSql.input("CartId", sql.Int, cartId);

    requestSql.query(query, (err, result) => {
        if (err) {
            console.error("Error deleting cart item:", err);
            return res.status(500).send({ error: "Internal server error" });
        }
        res.send({ message: "Product removed from cart successfully" });
    });
});

module.exports = router;
