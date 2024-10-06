const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const checkConnection = require('./utils/db'); // ฟังก์ชันเช็คการเชื่อมต่อฐานข้อมูล
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order'); // ระบุ path ที่ถูกต้อง
const chartRoutes = require('./routes/chart');
const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:4200" }));

// ให้บริการไฟล์ static จากโฟลเดอร์ 'uploads'
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);  // เปลี่ยนเส้นทางเป็น /orders
app.use('/chart', chartRoutes);

// เช็คการเชื่อมต่อกับ SQL Server และเริ่มเซิร์ฟเวอร์
checkConnection().then(() => {
    app.listen(3000, () => {
        console.log("Listening on port 3000...");
    });
}).catch(err => {
    console.error("Unable to start server due to connection failure:", err);
});
