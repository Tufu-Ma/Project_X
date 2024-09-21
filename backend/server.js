const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sql = require("mssql");
const checkConnection = require('./utils/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:4200" }));

// เพิ่มส่วนนี้เพื่อให้บริการไฟล์ที่อยู่ในโฟลเดอร์ 'uploads'
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);

// Check the SQL Server connection and start the server
checkConnection().then(() => {
    app.listen(3000, () => {
        console.log("Listening on port 3000...");
    });
}).catch(err => {
    console.error("Unable to start server due to connection failure:", err);
});
