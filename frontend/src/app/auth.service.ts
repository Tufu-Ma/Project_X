import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';  // URL สำหรับ backend สำหรับการ login, register, และ reset password
  private productAdminUrl = 'http://localhost:3000/products'; // URL สำหรับการจัดการสินค้า (Admin)

  constructor(private http: HttpClient) { }

  // ฟังก์ชันสำหรับการลงทะเบียน
  register(email: string, password: string, username: string, phone: string, firstName: string, lastName: string, gender: string): Observable<any> {
    const registerData = { emailOrUsername: email, password, username, phone, firstName, lastName, gender };

    // ตรวจสอบให้แน่ใจว่า header มี Content-Type เป็น application/json
    const headers = { 'Content-Type': 'application/json' };

    return this.http.post<any>(`${this.apiUrl}/register`, registerData, { headers });  // ใช้ /auth/register
}

  
  // ฟังก์ชันสำหรับการเข้าสู่ระบบ
  login(emailOrUsername: string, password: string): Observable<any> {
    const loginData = { emailOrUsername, password };
    return this.http.post<any>(`${this.apiUrl}/login`, loginData);  // ใช้ /auth/login สำหรับการเข้าสู่ระบบ
  }

  // ฟังก์ชันสำหรับการรีเซ็ตรหัสผ่าน
  resetPassword(email: string, phone: string, newPassword: string): Observable<any> {
    const resetPasswordData = { email, phone, newPassword };
    return this.http.post<any>(`${this.apiUrl}/reset-password`, resetPasswordData);  // เรียกใช้ API reset-password
  }

  // ฟังก์ชันสำหรับการดึง Role จาก JWT Token
  decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT", error);
      return null;
    }
  }

  // ฟังก์ชันสำหรับการดึง Role จาก JWT Token
  getRoleFromToken(token: string): string {
    if (!token) return '';  // ถ้าไม่มี token ให้คืนค่าว่าง
    try {
      const decoded: any = this.decodeJWT(token);  // ถอดรหัส JWT ด้วยฟังก์ชันที่เขียนเอง
      return decoded?.role || '';  // ดึงข้อมูล role จาก token ที่ถอดรหัสแล้ว
    } catch (error) {
      console.error("Error decoding token", error);
      return '';  // ถ้ามีปัญหาในการถอดรหัส token ให้คืนค่าว่าง
    }
  }

  // ฟังก์ชันสำหรับเพิ่มสินค้า (Admin)
addProduct(
  productName: string, 
  description: string, 
  price: number, 
  stock: number, 
  brand: string, 
  model: string, 
  categoryId: number, 
  image: File
): Observable<any> {
  const formData = new FormData();
  formData.append('productName', productName);
  formData.append('description', description);
  formData.append('price', price.toString());
  formData.append('stock', stock.toString());  // เพิ่ม stock
  formData.append('brand', brand);             // เพิ่ม brand
  formData.append('model', model);             // เพิ่ม model
  formData.append('categoryId', categoryId.toString()); // เพิ่ม categoryId
  formData.append('image', image);

  return this.http.post<any>(this.productAdminUrl, formData);  // ส่งข้อมูลไปยัง backend
}

}
