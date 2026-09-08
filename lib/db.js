import mysql from 'mysql2/promise';

// ตั้งค่าการเชื่อมต่อฐานข้อมูล (ปรับเปลี่ยนค่าตามเซิร์ฟเวอร์ของคุณ เช่น XAMPP ใช้พอร์ตและรหัสผ่านค่าเริ่มต้น)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // ใส่รหัสผ่านของคุณ (ถ้ามี)
  database: 'barker', // ชื่อฐานข้อมูลจากภาพตัวอย่างของคุณ
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;