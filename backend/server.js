const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const checkConnection = require('./utils/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order'); // ระบุ path ที่ถูกต้อง
const chartRoutes = require('./routes/chart');
const categoriesRouter = require('./routes/categories');


const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:4200" }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use('/chart', chartRoutes);
app.use('/categories', categoriesRouter);


// เช็คการเชื่อมต่อกับ SQL Server และเริ่มเซิร์ฟเวอร์
checkConnection()
    .then(() => {
        app.listen(3000, () => {
            console.log("Server is listening on port 3000...");
        });
    })
    .catch(err => {
        console.error("Unable to start server due to connection failure:", err);
        process.exit(1);  // หากการเชื่อมต่อล้มเหลว ให้หยุดการทำงานของเซิร์ฟเวอร์
    });
