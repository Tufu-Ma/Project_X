const express = require('express');
const sql = require('mssql');
const checkConnection = require('./../utils/db'); // เชื่อมต่อฐานข้อมูล SQL Server
const router = express.Router();

// เพิ่มสินค้าลงในรถเข็น
router.post('/add', async (req, res) => {
    const { userId, productId, productName, price, imageUrl, quantity } = req.body; // เอา description และ brand ออก

    // ตรวจสอบและกำหนดค่า default ให้ productName และ imageUrl ถ้าค่าเป็น null หรือ undefined
    const validProductName = productName || 'Unnamed Product'; // ตั้งค่า default ถ้าไม่มี productName
    const validImageUrl = imageUrl || ''; // ตั้งค่า default ถ้าไม่มี imageUrl

    if (!userId || !productId || !quantity) {
        console.log('Invalid input:', { userId, productId, quantity, productName });
        return res.status(400).send({ error: 'UserId, ProductId, and quantity are required' });
    }

    try {
        const pool = await checkConnection();
        console.log('Connection Successful!');

        const checkCart = await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query('SELECT * FROM Cart WHERE UserId = @userId AND ProductId = @productId');

        if (checkCart.recordset.length > 0) {
            const currentQuantity = checkCart.recordset[0].Quantity;
            await pool.request()
                .input('quantity', sql.Int, currentQuantity + quantity)
                .input('userId', sql.Int, userId)
                .input('productId', sql.Int, productId)
                .query('UPDATE Cart SET Quantity = @quantity WHERE UserId = @userId AND ProductId = @productId');
            res.status(200).json({ message: 'Quantity updated in cart' });
        } else {
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('productId', sql.Int, productId)
                .input('productName', sql.NVarChar, validProductName) // ใช้ค่า validProductName
                .input('price', sql.Decimal, price)
                .input('imageUrl', sql.NVarChar, validImageUrl) // ใช้ค่า validImageUrl
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
        .query('SELECT CartId, ProductId, ProductName, Quantity, Price FROM Cart WHERE UserId = @UserId'); // เพิ่ม CartId
  
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
            // เริ่มต้นสร้างคำสั่งซื้อในตาราง Orders
            let totalAmount = 0;

            const orderResult = await transaction.request()
                .input('UserId', sql.Int, userId)
                .query('INSERT INTO Orders (UserId, OrderDate, TotalAmount) OUTPUT INSERTED.OrderId VALUES (@UserId, GETDATE(), 0)');

            const orderId = orderResult.recordset[0].OrderId;

            for (const item of items) {
                const { productId, quantity } = item;

                // ตรวจสอบข้อมูลก่อนที่จะเพิ่มลง OrderItems
                if (!productId || quantity <= 0) {
                    await transaction.rollback();
                    return res.status(400).json({ error: "Invalid product or quantity" });
                }

                // ดึงราคาต่อหน่วย (UnitPrice) ของสินค้าจากฐานข้อมูล
                const productResult = await transaction.request()
                    .input('ProductId', sql.Int, productId)
                    .query('SELECT Price FROM Products WHERE ProductId = @ProductId');

                const unitPrice = productResult.recordset[0].Price;
                const totalPrice = unitPrice * quantity;

                // เพิ่มสินค้าลงในตาราง OrderItems พร้อมกับ UnitPrice
                await transaction.request()
                    .input('OrderId', sql.Int, orderId)
                    .input('ProductId', sql.Int, productId)
                    .input('Quantity', sql.Int, quantity)
                    .input('Price', sql.Decimal(10, 2), unitPrice)
                    .query('INSERT INTO OrderItems (OrderId, ProductId, Quantity, Price) VALUES (@OrderId, @ProductId, @Quantity, @Price)');

                // สะสม TotalAmount (ยอดรวมทั้งหมด)
                totalAmount += totalPrice;
            }

            // อัปเดตยอดรวมในตาราง Orders
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
