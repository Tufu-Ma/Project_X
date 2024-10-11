const express = require('express');
const sql = require('mssql');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Config สำหรับ multer เพื่อจัดเก็บไฟล์พร้อมนามสกุล
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');  // ระบุที่อยู่สำหรับบันทึกไฟล์
  },
  filename: function (req, file, cb) {
    const fileExtension = path.extname(file.originalname); // ดึงนามสกุลไฟล์
    const baseName = path.basename(file.originalname, fileExtension); // ชื่อไฟล์ที่ไม่มีนามสกุล
    cb(null, baseName + '-' + Date.now() + fileExtension);  // เพิ่ม timestamp ป้องกันชื่อไฟล์ซ้ำ
  }
});
const upload = multer({ storage: storage });

// Route สำหรับการแนะนำสินค้าตามคำค้นหา (วาง route นี้ไว้ก่อน /:id เพื่อป้องกันการชนกัน)
router.get('/suggestions', (req, res) => {
  const searchTerm = req.query.search;
  
  if (!searchTerm) {
    return res.status(400).send({ error: 'Search term is required' });
  }

  const query = `SELECT TOP 5 * FROM Products WHERE ProductName LIKE @SearchTerm`;  // จำกัดการค้นหา 5 รายการ
  const requestSql = new sql.Request();
  requestSql.input('SearchTerm', sql.NVarChar, `%${searchTerm}%`);

  requestSql.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching product suggestions:', err);
      return res.status(500).send({ error: 'Internal server error' });
    }
    res.send(result.recordset);
  });
});

// Route สำหรับเพิ่มสินค้า
router.post('/', upload.single('image'), (req, res) => {
  console.log('Received product data:', req.body);  
  console.log('Uploaded file:', req.file);  // แสดงไฟล์ที่ถูกอัปโหลด
  
  const { productName, categoryId, description, price, stock, brand, model } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // ตรวจสอบฟิลด์ที่จำเป็น
  if (!productName || !categoryId || !price || !stock) {
    console.error('Missing required fields');
    return res.status(400).send({ error: 'Missing required fields' });
  }

  // สร้าง query สำหรับเพิ่มสินค้า
  const query = `
    INSERT INTO Products (ProductName, CategoryId, Description, Price, Stock, Brand, Model, ImageUrl, CreatedDate, UpdatedDate)
    VALUES (@ProductName, @CategoryId, @Description, @Price, @Stock, @Brand, @Model, @ImageUrl, GETDATE(), GETDATE())
  `;

  const requestSql = new sql.Request();
  requestSql.input('ProductName', sql.NVarChar, productName);
  requestSql.input('CategoryId', sql.Int, categoryId);
  requestSql.input('Description', sql.NVarChar, description || null);
  requestSql.input('Price', sql.Decimal(10, 2), price);
  requestSql.input('Stock', sql.Int, stock);
  requestSql.input('Brand', sql.NVarChar, brand || null);
  requestSql.input('Model', sql.NVarChar, model || null);
  requestSql.input('ImageUrl', sql.NVarChar, imageUrl || null);

  // ทำการ query เพื่อเพิ่มข้อมูลสินค้า
  requestSql.query(query, (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);  
      return res.status(500).send({ error: 'Internal server error' });
    }
    res.send({ message: 'Product added successfully', imageUrl });
  });
});

// Route สำหรับดึงสินค้าทั้งหมด
router.get('/', (req, res) => {
  const query = "SELECT * FROM Products";
  const requestSql = new sql.Request();

  requestSql.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).send({ error: "Internal server error" });
    }
    res.send(result.recordset);  
  });
});

// Route สำหรับดึงสินค้าตาม ID
router.get('/:id', (req, res) => {
  const productId = req.params.id;
  if (!productId) {
    return res.status(400).send({ error: "Product ID is required" });
  }

  const query = "SELECT * FROM Products WHERE ProductId = @ProductId";
  const requestSql = new sql.Request();

  requestSql.input("ProductId", sql.Int, productId);
  requestSql.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching product by ID:", err);
      return res.status(500).send({ error: "Internal server error" });
    }
    if (result.recordset.length === 0) {
      return res.status(404).send({ error: "Product not found" });
    }
    res.send(result.recordset[0]);
  });
});

// Route สำหรับลบสินค้า
router.delete('/:id', (req, res) => {
  const productId = req.params.id;
  if (!productId) {
    return res.status(400).send({ error: "Product ID is required" });
  }

  const query = "DELETE FROM Products WHERE ProductId = @ProductId";
  const requestSql = new sql.Request();

  requestSql.input("ProductId", sql.Int, productId);
  requestSql.query(query, (err, result) => {
    if (err) {
      console.error("Error deleting product:", err);
      return res.status(500).send({ error: "Internal server error" });
    }
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send({ error: "Product not found" });
    }
    res.send({ message: "Product deleted successfully" });
  });
});

// Route สำหรับแก้ไขสินค้า
router.put('/:id', upload.single('image'), (req, res) => {
  const productId = req.params.id;
  console.log('Updating product with ID:', productId);

  const { productName, categoryId, description, price, stock, brand, model } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // ตรวจสอบฟิลด์ที่จำเป็น
  if (!productName || !categoryId || !price || !stock) {
    console.error('Missing required fields');
    return res.status(400).send({ error: 'Missing required fields' });
  }

  // กรณีไม่อัปโหลดรูปภาพใหม่ ให้เก็บ URL รูปภาพเดิมไว้
  const query = `
    UPDATE Products
    SET ProductName = @ProductName,
        CategoryId = @CategoryId,
        Description = @Description,
        Price = @Price,
        Stock = @Stock,
        Brand = @Brand,
        Model = @Model,
        ImageUrl = ISNULL(@ImageUrl, ImageUrl),  -- เก็บค่าภาพเดิมหากไม่มีการอัปเดต
        UpdatedDate = GETDATE()
    WHERE ProductId = @ProductId
  `;

  const requestSql = new sql.Request();
  requestSql.input('ProductName', sql.NVarChar, productName);
  requestSql.input('CategoryId', sql.Int, categoryId);
  requestSql.input('Description', sql.NVarChar, description || null);
  requestSql.input('Price', sql.Decimal(10, 2), price);
  requestSql.input('Stock', sql.Int, stock);
  requestSql.input('Brand', sql.NVarChar, brand || null);
  requestSql.input('Model', sql.NVarChar, model || null);
  requestSql.input('ImageUrl', sql.NVarChar, imageUrl || null);
  requestSql.input('ProductId', sql.Int, productId);

  // ทำการ query เพื่ออัปเดตข้อมูลสินค้า
  requestSql.query(query, (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).send({ error: 'Internal server error' });
    }
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send({ error: 'Product not found' });
    }
    res.send({ message: 'Product updated successfully' });
  });
});

router.get('/category', (req, res) => {
  const ids = req.query.ids.split(',').map(id => parseInt(id, 10));
  const query = `SELECT * FROM Products WHERE CategoryId IN (${ids.join(',')})`;
  const requestSql = new sql.Request();
  
  requestSql.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching products by categories:', err);
      return res.status(500).send({ error: 'Internal server error' });
    }
    res.send(result.recordset);
  });
});

module.exports = router;
