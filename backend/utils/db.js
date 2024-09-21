const sql = require("mssql");

const config = {
    user: "sa",
    password: "@Farm2963789",
    server: "TufuXD",
    database: "B",
    options: {
        encrypt: false, // หรือ true ถ้าคุณใช้ SQL Server กับ Azure
        trustServerCertificate: true // สำหรับการเชื่อมต่อที่ไม่ปลอดภัย
    }
};

function checkConnection() {
    return sql.connect(config)
        .then(() => {
            console.log("Connection Successful!");
        })
        .catch(err => {
            console.error("Connection Failed:", err);
            return Promise.reject(err);
        });
}

module.exports = checkConnection;
