const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const checkConnection = require('./utils/db'); // ฟังก์ชันเช็คการเชื่อมต่อฐานข้อมูล
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRouter = require('./routes/order');  // นำเข้า router สำหรับ order
const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:4200" }));

// ให้บริการไฟล์ static จากโฟลเดอร์ 'uploads'
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use(orderRouter);  // ใช้ router สำหรับ order

// เช็คการเชื่อมต่อกับ SQL Server และเริ่มเซิร์ฟเวอร์
checkConnection().then(() => {
    app.listen(3000, () => {
        console.log("Listening on port 3000...");
    });
}).catch(err => {
    console.error("Unable to start server due to connection failure:", err);
});
