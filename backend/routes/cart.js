const express = require('express');
const sql = require('mssql');
const checkConnection = require('./../utils/db'); // เชื่อมต่อฐานข้อมูล SQL Server
const router = express.Router();

// เพิ่มสินค้าลงในรถเข็น
router.post('/add', async (req, res) => {
    const { userId, productId, productName, price, imageUrl, quantity } = req.body;

    const validProductName = productName || 'Unnamed Product';
    const validImageUrl = imageUrl || '';

    if (!userId || !productId || !quantity) {
        console.log('Invalid input:', { userId, productId, quantity, productName });
        return res.status(400).send({ error: 'UserId, ProductId, and quantity are required' });
    }

    try {
        const pool = await checkConnection();

        // ดึงข้อมูล stock ของสินค้า
        const stockResult = await pool.request()
            .input('productId', sql.Int, productId)
            .query('SELECT Stock FROM Products WHERE ProductId = @productId');

        const productStock = stockResult.recordset[0].Stock;

        if (!productStock || quantity > productStock) {
            return res.status(400).json({ error: 'Quantity exceeds available stock' });
        }

        // ตรวจสอบว่ามีสินค้าอยู่ในรถเข็นหรือยัง
        const checkCart = await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query('SELECT * FROM Cart WHERE UserId = @userId AND ProductId = @productId');

        if (checkCart.recordset.length > 0) {
            const currentQuantity = checkCart.recordset[0].Quantity;
            const newQuantity = currentQuantity + quantity;

            if (newQuantity > productStock) {
                return res.status(400).json({ error: 'Quantity exceeds available stock' });
            }

            await pool.request()
                .input('quantity', sql.Int, newQuantity)
                .input('userId', sql.Int, userId)
                .input('productId', sql.Int, productId)
                .query('UPDATE Cart SET Quantity = @quantity WHERE UserId = @userId AND ProductId = @productId');
            res.status(200).json({ message: 'Quantity updated in cart' });
        } else {
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('productId', sql.Int, productId)
                .input('productName', sql.NVarChar, validProductName)
                .input('price', sql.Decimal, price)
                .input('imageUrl', sql.NVarChar, validImageUrl)
                .input('quantity', sql.Int, quantity)
                .query('INSERT INTO Cart (UserId, ProductId, ProductName, Price, ImageUrl, Quantity) VALUES (@userId, @productId, @productName, @price, @imageUrl, @quantity)');
            res.status(200).json({ message: 'Product added to cart' });
        }
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




// เส้นทางสำหรับดึงข้อมูลรถเข็น
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
  
    if (!userId || userId === 'null') {
      return res.status(400).send({ error: 'User ID is required' });
    }
  
    try {
      const pool = await checkConnection();
      const result = await pool.request()
        .input('UserId', sql.Int, userId)
        .query(`
          SELECT CartId, c.ProductId, p.ProductName, c.Quantity, p.Price, p.ImageUrl 
          FROM Cart c
          JOIN Products p ON c.ProductId = p.ProductId
          WHERE c.UserId = @UserId
        `); // เพิ่มการดึง ImageUrl จากตาราง Products
  
      if (result.recordset.length === 0) {
        return res.status(404).send({ message: 'No items in cart for this user' });
      }
  
      res.send(result.recordset);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      res.status(500).send({ error: 'Internal server error' });
    }
});

  


// อัปเดตจำนวนสินค้าในรถเข็น
router.put('/:cartId', async (req, res) => {
    const { cartId } = req.params;
    const { quantity } = req.body;

    // ตรวจสอบว่า cartId และ quantity ถูกต้องหรือไม่
    if (!cartId || isNaN(cartId)) {
        console.log('Invalid CartId:', cartId);
        return res.status(400).send({ error: 'Invalid CartId' });
    }

    if (!quantity || quantity <= 0) {
        console.log('Invalid quantity:', quantity);
        return res.status(400).send({ error: 'Quantity must be greater than 0' });
    }

    try {
        const pool = await checkConnection();
        await pool.request()
            .input('CartId', sql.Int, cartId)
            .input('Quantity', sql.Int, quantity)
            .query('UPDATE Cart SET Quantity = @Quantity WHERE CartId = @CartId');

        res.send({ message: "Cart updated successfully" });
    } catch (err) {
        console.error("Error updating cart:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});


// ลบสินค้าจากรถเข็น
router.delete('/remove/:cartId', async (req, res) => {
    const { cartId } = req.params;

    // ตรวจสอบว่า cartId เป็นตัวเลขหรือไม่
    if (!cartId || isNaN(cartId)) {
        console.log('Invalid CartId:', cartId);
        return res.status(400).json({ message: 'Invalid CartId' });
    }

    try {
        const pool = await checkConnection();
        const result = await pool.request()
            .input('CartId', sql.Int, cartId)
            .query('DELETE FROM Cart WHERE CartId = @CartId');

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ message: 'Item removed from cart' });
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ message: 'Internal Server Error' });
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
            const firstItem = items[0];
            const firstProductResult = await transaction.request()
                .input('ProductId', sql.Int, firstItem.productId)
                .query('SELECT ProductName, Price, ImageUrl FROM Products WHERE ProductId = @ProductId');

            const firstProduct = firstProductResult.recordset[0];
            const firstTotalPrice = firstProduct.Price * firstItem.quantity;

            const orderResult = await transaction.request()
                .input('UserId', sql.Int, userId)
                .input('Name', sql.NVarChar(255), userName)
                .input('ProductName', sql.NVarChar(255), firstProduct.ProductName)
                .input('Quantity', sql.Int, firstItem.quantity)
                .input('ImageUrl', sql.NVarChar(255), firstProduct.ImageUrl)
                .input('TotalAmount', sql.Decimal(10, 2), firstTotalPrice)
                .input('ProductId', sql.Int, firstItem.productId) // เพิ่ม ProductId
                .query(`INSERT INTO Orders (UserId, Name, OrderDate, ProductName, Quantity, ImageUrl, TotalAmount, ProductId) 
                        OUTPUT INSERTED.OrderId 
                        VALUES (@UserId, @Name, GETDATE(), @ProductName, @Quantity, @ImageUrl, @TotalAmount, @ProductId)`); // เพิ่ม ProductId ที่นี่

            const orderId = orderResult.recordset[0].OrderId;

            // ถ้ามีสินค้ามากกว่า 1 ชิ้น ทำการเพิ่มข้อมูลลงในตาราง OrderItems
            for (const item of items) {
                const { productId, quantity } = item;

                const productResult = await transaction.request()
                    .input('ProductId', sql.Int, productId)
                    .query('SELECT ProductName, Price, ImageUrl FROM Products WHERE ProductId = @ProductId');

                const product = productResult.recordset[0];
                const totalPrice = product.Price * quantity;

                await transaction.request()
                    .input('OrderId', sql.Int, orderId)
                    .input('ProductId', sql.Int, productId)
                    .input('Quantity', sql.Int, quantity)
                    .input('Price', sql.Decimal(10, 2), product.Price)
                    .input('ImageUrl', sql.NVarChar(255), product.ImageUrl)
                    .query(`
                        INSERT INTO OrderItems (OrderId, ProductId, Quantity, Price, ImageUrl) 
                        VALUES (@OrderId, @ProductId, @Quantity, @Price, @ImageUrl)
                    `);

                // อัปเดต stock ในตาราง Products หลังจากสั่งซื้อ
                await transaction.request()
                    .input('Quantity', sql.Int, quantity)
                    .input('ProductId', sql.Int, productId)
                    .query('UPDATE Products SET Stock = Stock - @Quantity WHERE ProductId = @ProductId');

                totalAmount += totalPrice;
            }

            // อัปเดตยอดรวมทั้งหมดในตาราง Orders
            await transaction.request()
                .input('OrderId', sql.Int, orderId)
                .input('TotalAmount', sql.Decimal(10, 2), totalAmount)
                .query('UPDATE Orders SET TotalAmount = @TotalAmount WHERE OrderId = @OrderId');

            // ลบสินค้าที่ถูกสั่งซื้อออกจากตะกร้า
            await transaction.request()
                .input('UserId', sql.Int, userId)
                .query('DELETE FROM Cart WHERE UserId = @UserId');

            await transaction.commit();

            res.status(201).json({ message: "Order placed successfully", orderId, totalAmount });
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



module.exports = router;
