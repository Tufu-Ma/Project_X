const express = require('express'); // นำเข้า express
const sql = require('mssql'); // นำเข้า mssql
const exceljs = require('exceljs'); // นำเข้า exceljs
const router = express.Router(); // สร้าง router ของ express
const checkConnection = require('../utils/db'); // เชื่อมต่อกับฐานข้อมูล

// ฟังก์ชันสำหรับดึงข้อมูลยอดขาย
async function getSalesData(startDate, endDate) {
    const pool = await checkConnection(); // เชื่อมต่อกับฐานข้อมูล
    const result = await pool.request()
        .input('startDate', sql.Date, startDate) // รับพารามิเตอร์ startDate
        .input('endDate', sql.Date, endDate) // รับพารามิเตอร์ endDate
        .query(`SELECT CAST(O.OrderDate AS DATE) AS date, SUM(OI.TotalAmount) AS total
                FROM OrderItems OI
                JOIN Orders O ON OI.OrderId = O.OrderId
                WHERE O.OrderStatus != 'Cancelled' AND O.OrderDate BETWEEN @startDate AND @endDate
                GROUP BY CAST(O.OrderDate AS DATE)`);
    
    return result.recordset; // ส่งข้อมูลที่ดึงมา
}

// ฟังก์ชันสำหรับดึงสินค้าขายดีที่สุด
async function getBestSellingProducts(startDate, endDate) {
    const pool = await checkConnection(); // เชื่อมต่อกับฐานข้อมูล
    const result = await pool.request()
        .input('startDate', sql.Date, startDate) // ส่งพารามิเตอร์ startDate
        .input('endDate', sql.Date, endDate) // ส่งพารามิเตอร์ endDate
        .query(`
            SELECT TOP 5 P.ProductName, SUM(OI.Quantity) AS TotalQuantity, SUM(OI.TotalAmount) AS TotalSales
            FROM OrderItems OI
            JOIN Products P ON OI.ProductId = P.ProductId
            JOIN Orders O ON OI.OrderId = O.OrderId
            WHERE O.OrderStatus != 'Cancelled' AND O.OrderDate BETWEEN @startDate AND @endDate
            GROUP BY P.ProductName
            ORDER BY TotalQuantity DESC
        `);
    return result.recordset; // ส่งข้อมูลสินค้าที่ขายดีที่สุด
}

// ฟังก์ชันสำหรับดึงสินค้าที่ขายไม่ดี
async function getWorstSellingProducts(startDate, endDate) {
    const pool = await checkConnection(); // เชื่อมต่อกับฐานข้อมูล
    const result = await pool.request()
        .input('startDate', sql.Date, startDate) // ส่งพารามิเตอร์ startDate
        .input('endDate', sql.Date, endDate) // ส่งพารามิเตอร์ endDate
        .query(`
            SELECT TOP 5 P.ProductName, SUM(OI.Quantity) AS TotalQuantity, SUM(OI.TotalAmount) AS TotalSales
            FROM OrderItems OI
            JOIN Products P ON OI.ProductId = P.ProductId
            JOIN Orders O ON OI.OrderId = O.OrderId
            WHERE O.OrderStatus != 'Cancelled' AND O.OrderDate BETWEEN @startDate AND @endDate
            GROUP BY P.ProductName
            ORDER BY TotalQuantity ASC
        `);
    return result.recordset; // ส่งข้อมูลสินค้าที่ขายไม่ดี
}

async function getSalesProducts(startDate, endDate) {
    const pool = await checkConnection();
    const result = await pool.request()
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate)
        .query(`
            SELECT P.ProductName, SUM(OI.Quantity) AS TotalQuantity, SUM(OI.TotalAmount) AS TotalSales
            FROM OrderItems OI
            JOIN Products P ON OI.ProductId = P.ProductId
            JOIN Orders O ON OI.OrderId = O.OrderId
            WHERE O.OrderStatus != 'Cancelled' AND O.OrderDate BETWEEN @startDate AND @endDate
            GROUP BY P.ProductName
        `);
    
    return result.recordset;
}

// Route สำหรับดาวน์โหลดรายงาน
router.get('/download', async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'ต้องระบุวันเริ่มต้นและวันสิ้นสุด' });
    }

    try {
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('รายงานยอดขาย');

        worksheet.columns = [
            { header: 'วันที่', key: 'date', width: 15 },
            { header: 'ยอดขายรวม', key: 'total', width: 15 },
            { header: 'สินค้าที่ขายดีที่สุด', key: 'bestProduct', width: 20 },
            { header: 'สินค้าที่ขายไม่ดี', key: 'worstProduct', width: 20 },
        ];

        const salesData = await getSalesData(startDate, endDate);
        const salesProducts = await getSalesProducts(startDate, endDate); // ดึงข้อมูลสินค้าทั้งหมดในช่วงเวลาเดียวกัน

        // ดึงข้อมูลสินค้าที่ขายดีที่สุด
        const bestSellingProducts = salesProducts.sort((a, b) => b.TotalQuantity - a.TotalQuantity).slice(0, 5);
        // ดึงข้อมูลสินค้าที่ขายไม่ดี
        const worstSellingProducts = salesProducts.sort((a, b) => a.TotalQuantity - b.TotalQuantity).slice(0, 5);

        for (const sale of salesData) {
            worksheet.addRow({
                date: new Date(sale.date).toISOString().split('T')[0],
                total: sale.total,
                bestProduct: bestSellingProducts.length > 0 ? bestSellingProducts.map(item => item.ProductName).join(', ') : 'ไม่มี',
                worstProduct: worstSellingProducts.length > 0 ? worstSellingProducts.map(item => item.ProductName).join(', ') : 'ไม่มี',
            });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดาวน์โหลดรายงาน:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดาวน์โหลดรายงาน', error: error.message });
    }
});

// ดึงข้อมูลยอดขายระหว่างช่วงวันที่
router.get('/sales-summary', async (req, res) => {
    const { startDate, endDate } = req.query; // รับพารามิเตอร์วันที่จาก query

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'ต้องระบุวันเริ่มต้นและวันสิ้นสุด' });
    }

    try {
        const pool = await checkConnection(); // เชื่อมต่อกับฐานข้อมูล
        const result = await pool.request()
            .input('startDate', sql.Date, startDate) // ส่งพารามิเตอร์ startDate
            .input('endDate', sql.Date, endDate) // ส่งพารามิเตอร์ endDate
            .query(`SELECT CAST(O.OrderDate AS DATE) AS date, SUM(OI.TotalAmount) AS total
                    FROM OrderItems OI
                    JOIN Orders O ON OI.OrderId = O.OrderId
                    WHERE O.OrderStatus != 'Cancelled' AND O.OrderDate BETWEEN @startDate AND @endDate
                    GROUP BY CAST(O.OrderDate AS DATE)`);
        
        const totalSales = result.recordset.reduce((sum, item) => sum + item.total, 0); // คำนวณยอดขายรวม
        res.json({ totalSales, sales: result.recordset }); // ส่งยอดขายรวมและข้อมูลยอดขายตามวัน
    } catch (err) {
        console.error('เกิดข้อผิดพลาดในการดึงยอดขายสรุป:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงยอดขายสรุป', error: err.message });
    }
});

// ดึงข้อมูลจากตาราง OrderItems ทั้งหมด
router.get('/order-items', async (req, res) => {
    try {
        const pool = await checkConnection(); // ใช้การเชื่อมต่อฐานข้อมูล
        const result = await pool.request().query('SELECT * FROM OrderItems'); // ดึงข้อมูลจากตาราง OrderItems
        res.json(result.recordset); // ส่งข้อมูลในรูปแบบ JSON กลับไปให้ client
    } catch (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายการสั่งซื้อ:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการสั่งซื้อ', error: err.message });
    }
});

// Route สำหรับดึงข้อมูลสินค้าที่ขายดีที่สุด
router.get('/best-selling-products', async (req, res) => {
    const { startDate, endDate } = req.query; // รับพารามิเตอร์วันที่จาก query
    console.log(`Received request for best-selling-products from ${startDate} to ${endDate}`);

    try {
        const bestSellingProducts = await getBestSellingProducts(startDate, endDate); // เรียกใช้งานฟังก์ชัน
        console.log('Best Selling Products:', bestSellingProducts); // แสดงข้อมูลใน console
        res.json(bestSellingProducts); // ส่งข้อมูลสินค้าที่ขายดีที่สุดกลับไป
    } catch (error) {
        console.error('Error fetching best selling products:', error);
        res.status(500).json({ message: 'Error fetching best selling products', error: error.message });
    }
});

// Route สำหรับดึงข้อมูลสินค้าที่ขายไม่ดี
router.get('/worst-selling-products', async (req, res) => {
    const { startDate, endDate } = req.query; // รับพารามิเตอร์วันที่จาก query

    try {
        const worstSellingProducts = await getWorstSellingProducts(startDate, endDate); // เรียกใช้งานฟังก์ชัน
        res.json(worstSellingProducts); // ส่งข้อมูลสินค้าที่ขายไม่ดีกลับไป
    } catch (error) {
        console.error('Error fetching worst selling products:', error);
        res.status(500).json({ message: 'Error fetching worst selling products', error: error.message });
    }
});

module.exports = router; // ส่งออก router
