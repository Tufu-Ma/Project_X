const express = require('express');
const sql = require('mssql');
const router = express.Router();

// Route สำหรับเพิ่มหมวดหมู่
router.post('/', async (req, res) => {
  const { categoryName, status } = req.body;

  // ตรวจสอบว่ามีการส่งชื่อหมวดหมู่หรือไม่
  if (!categoryName) {
    return res.status(400).send({ error: 'Category name is required' });
  }

  const query = `
    INSERT INTO Categories (CategoryName, Status, CreatedDate, UpdatedDate)
    VALUES (@CategoryName, @Status, GETDATE(), GETDATE())
  `;

  try {
    const requestSql = new sql.Request();
    requestSql.input('CategoryName', sql.NVarChar, categoryName);
    requestSql.input('Status', sql.NVarChar, status || 'Active');  // กำหนดค่าเริ่มต้นเป็น Active หากไม่มีการส่งมา

    await requestSql.query(query);
    res.send({ message: 'Category added successfully' });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).send({ error: 'Internal server error' });
  }
});

// Route สำหรับแก้ไขสถานะหมวดหมู่
router.put('/:id', async (req, res) => {
  const categoryId = parseInt(req.params.id, 10);  // แปลงค่า id ที่รับเข้ามาเป็นตัวเลข
  const { status } = req.body;

  // ตรวจสอบว่ามีการส่งสถานะหมวดหมู่หรือไม่
  if (!status) {
    return res.status(400).send({ error: 'Status is required' });
  }

  // ตรวจสอบว่า categoryId เป็นตัวเลขที่ถูกต้อง
  if (isNaN(categoryId)) {
    return res.status(400).send({ error: 'Invalid category ID' });
  }

  const query = `
    UPDATE Categories SET Status = @Status, UpdatedDate = GETDATE()
    WHERE CategoryId = @CategoryId
  `;

  try {
    const requestSql = new sql.Request();
    requestSql.input('Status', sql.NVarChar, status);
    requestSql.input('CategoryId', sql.Int, categoryId);

    const result = await requestSql.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send({ error: 'Category not found' });
    }

    res.send({ message: 'Category status updated successfully' });
  } catch (err) {
    console.error('Error updating category:', err);
    return res.status(500).send({ error: 'Internal server error' });
  }
});

// Route สำหรับดึงหมวดหมู่ทั้งหมด
router.get('/', async (req, res) => {
  try {
    const query = "SELECT * FROM Categories"; // ดึงหมวดหมู่ทั้งหมด
    const requestSql = new sql.Request();
    const result = await requestSql.query(query);
    res.send(result.recordset);  // ส่งข้อมูลหมวดหมู่กลับไปยัง frontend
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;
