const express = require('express');
const sql = require('mssql');
const router = express.Router();
const checkConnection = require('../utils/db'); // นำเข้า connection database

// สร้าง order ใหม่
router.post('/', async (req, res) => {
    const { UserId, TotalAmount, OrderStatus, ProductId } = req.body; // เพิ่ม ProductId

    // ตรวจสอบว่าข้อมูลที่จำเป็นถูกส่งมา
    if (!UserId || !TotalAmount || !ProductId) { // เพิ่มการตรวจสอบ ProductId
        return res.status(400).json({ message: 'UserId, TotalAmount, and ProductId are required' });
    }

    try {
        const pool = await checkConnection();
        const result = await pool.request()
            .input('UserId', sql.Int, UserId)
            .input('TotalAmount', sql.Decimal(10, 2), TotalAmount)
            .input('ProductId', sql.Int, ProductId) // เพิ่ม ProductId
            .input('OrderStatus', sql.NVarChar(50), OrderStatus || 'Pending')
            .query(`INSERT INTO Orders (UserId, TotalAmount, ProductId, OrderStatus, CreatedDate) 
                    VALUES (@UserId, @TotalAmount, @ProductId, @OrderStatus, GETDATE()); 
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

// เช็คเอาท์ (Checkout)
router.post('/checkout', async (req, res) => {
    const { userId, items } = req.body;

    if (!userId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "UserId and valid items are required" });
    }

    try {
        const pool = await checkConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // ดึงข้อมูลชื่อผู้ใช้จากตาราง Users
            const userResult = await transaction.request()
                .input('UserId', sql.Int, userId)
                .query('SELECT Name FROM Users WHERE UserId = @UserId');

            const userName = userResult.recordset[0].Name;

            if (!userName) {
                await transaction.rollback();
                return res.status(400).json({ error: "Invalid user" });
            }

            // เริ่มต้นสร้างคำสั่งซื้อในตาราง Orders
            let totalAmount = 0;

            // ตรวจสอบ stock ก่อนทำการสั่งซื้อทุกชิ้น
            for (const item of items) {
                const { productId, quantity } = item;

                // ตรวจสอบว่ามีสินค้าที่เลือกอยู่หรือไม่ และ stock เพียงพอหรือไม่
                const stockResult = await transaction.request()
                    .input('ProductId', sql.Int, productId)
                    .query('SELECT Stock, ProductName, Price, ImageUrl FROM Products WHERE ProductId = @ProductId');

                const product = stockResult.recordset[0];

                if (!product || product.Stock < quantity) {
                    await transaction.rollback();
                    return res.status(400).json({ error: `Insufficient stock for ${product.ProductName}` });
                }
            }

            // ถ้า stock เพียงพอ ทำการเพิ่มคำสั่งซื้อในตาราง Orders
            for (const item of items) {
                const { productId, quantity } = item;

                const productResult = await transaction.request()
                    .input('ProductId', sql.Int, productId)
                    .query('SELECT ProductName, Price, ImageUrl FROM Products WHERE ProductId = @ProductId');

                const product = productResult.recordset[0];
                const totalPrice = product.Price * quantity;

                // เพิ่มคำสั่งซื้อใน Orders พร้อม ProductId
                await transaction.request()
                    .input('UserId', sql.Int, userId)
                    .input('Name', sql.NVarChar(255), userName)
                    .input('ProductId', sql.Int, productId)
                    .input('ProductName', sql.NVarChar(255), product.ProductName)
                    .input('Quantity', sql.Int, quantity)
                    .input('ImageUrl', sql.NVarChar(255), product.ImageUrl)
                    .input('TotalAmount', sql.Decimal(10, 2), totalPrice)
                    .query(`
                        INSERT INTO Orders (UserId, Name, OrderDate, ProductId, ProductName, Quantity, ImageUrl, TotalAmount) 
                        VALUES (@UserId, @Name, GETDATE(), @ProductId, @ProductName, @Quantity, @ImageUrl, @TotalAmount)
                    `);

                // อัปเดต stock ในตาราง Products หลังจากสั่งซื้อ
                await transaction.request()
                    .input('Quantity', sql.Int, quantity)
                    .input('ProductId', sql.Int, productId)
                    .query('UPDATE Products SET Stock = Stock - @Quantity WHERE ProductId = @ProductId');

                totalAmount += totalPrice;
            }

            await transaction.commit();
            res.status(201).json({ message: "Order placed successfully", totalAmount });
        } catch (err) {
            await transaction.rollback();
            console.error("Transaction Error:", err);
            res.status(500).json({ error: "Failed to place order" });
        }
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ลบ order ตาม ID เฉพาะสถานะ Pending
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await checkConnection();
        
        // ตรวจสอบว่ามี Order อยู่จริงและสถานะเป็น Pending ก่อนลบ
        const checkResult = await pool.request()
            .input('OrderId', sql.Int, id)
            .query('SELECT ProductId, Quantity, OrderStatus FROM Orders WHERE OrderId = @OrderId');

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = checkResult.recordset[0];

        // ตรวจสอบสถานะคำสั่งซื้อ
        if (order.OrderStatus !== 'Pending') {
            return res.status(400).json({ message: 'Only orders with status "Pending" can be deleted' });
        }

        // อัปเดต stock ก่อนลบคำสั่งซื้อ
        const updateStockResult = await pool.request()
            .input('ProductId', sql.Int, order.ProductId)
            .input('Quantity', sql.Int, order.Quantity)
            .query('UPDATE Products SET Stock = Stock + @Quantity WHERE ProductId = @ProductId'); // คืน stock

        // ตรวจสอบว่า stock อัปเดตสำเร็จ
        if (updateStockResult.rowsAffected[0] === 0) {
            return res.status(500).json({ message: 'Failed to update stock' });
        }

        // ลบ Order เมื่อสถานะเป็น Pending
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
