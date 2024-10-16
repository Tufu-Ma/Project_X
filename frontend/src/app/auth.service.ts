import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';  // นำเข้า Router
import { isPlatformBrowser } from '@angular/common'; // นำเข้า isPlatformBrowser
import { HeaderService } from './services/header.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/auth';  // URL สำหรับ backend สำหรับการ login, register, และ reset password
  private productAdminUrl = 'http://localhost:3000/products'; // URL สำหรับการจัดการสินค้า (Admin)

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,  // Inject PLATFORM_ID
    private router: Router,
    private headerService: HeaderService // Inject HeaderService
  ) { }

  // Headers สำหรับ HTTP requests
  private jsonHeaders = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // ฟังก์ชันสำหรับการลงทะเบียน
  register(email: string, password: string, username: string, phone: string, firstName: string, lastName: string, gender: string): Observable<any> {
    const registerData = { emailOrUsername: email, password, username, phone, firstName, lastName, gender };
    return this.http.post<any>(`${this.apiUrl}/register`, registerData, this.jsonHeaders);
  }

  // ฟังก์ชันสำหรับการเข้าสู่ระบบ
  login(emailOrUsername: string, password: string): Observable<any> {
    const loginData = { emailOrUsername, password };
    return this.http.post<any>(`${this.apiUrl}/login`, loginData, this.jsonHeaders)
      .pipe(
        tap((response: { token: any; }) => {
          const token = response.token; // สมมติว่า response มี token
          this.saveToken(token); // บันทึก token
          const role = this.getRoleFromToken(); // ดึง role จาก token
          if (role) {  // ตรวจสอบว่ามี role จริงๆ
            this.headerService.setAdminStatus(role === 'Admin'); // เปลี่ยนสถานะเป็น admin ถ้า role เป็น 'admin'
          } else {
            console.error('No role found in token');
          }
        })
      );
  }

  // ฟังก์ชันสำหรับการรีเซ็ตรหัสผ่าน
  resetPassword(email: string, phone: string, newPassword: string): Observable<any> {
    const resetPasswordData = { email, phone, newPassword };
    return this.http.post<any>(`${this.apiUrl}/reset-password`, resetPasswordData, this.jsonHeaders);
  }

  // ฟังก์ชันสำหรับเก็บ token ใน localStorage
  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) { // ตรวจสอบว่าเป็นเบราว์เซอร์ก่อนเข้าถึง localStorage
      localStorage.setItem('token', token);
    }
  }

  // ฟังก์ชันสำหรับดึง token จาก localStorage
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) { // ตรวจสอบว่าเป็นเบราว์เซอร์ก่อนเข้าถึง localStorage
      return localStorage.getItem('token');
    }
    return null;
  }

  // ฟังก์ชันสำหรับตรวจสอบการล็อกอิน
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // ฟังก์ชันสำหรับการดึงข้อมูลจาก JWT Token
  decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];  // ดึงส่วน payload ของ JWT
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      console.log('Decoded JWT Payload:', jsonPayload);  // แสดง payload ที่ถอดรหัส

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT", error);
      return null;
    }
  }

  // ฟังก์ชันสำหรับการดึง Role จาก JWT Token
  getRoleFromToken(): string {
    const token = this.getToken();
    if (!token) return '';  // ถ้าไม่มี token ให้คืนค่าว่าง
    const decoded = this.decodeJWT(token);  // ถอดรหัส JWT ด้วยฟังก์ชันที่เขียนเอง
    return decoded?.role || '';  // ดึงข้อมูล role จาก token ที่ถอดรหัสแล้ว
  }

  // ฟังก์ชันสำหรับการดึง User ID จาก JWT Token
  getUserId(): number | null {
    const token = this.getToken();
    if (!token) {
      console.log('No token found');
      return null;
    }

    const decoded = this.decodeJWT(token);  // Decode JWT token
    console.log('Decoded JWT Payload:', decoded);  // ตรวจสอบการ Decode token

    if (decoded && typeof decoded.id === 'number') {  // ตรวจสอบว่ามี id และเป็นตัวเลขจริงๆ
      console.log('User ID:', decoded.id);  // Log เพื่อตรวจสอบค่า id
      return decoded.id;
    } else {
      console.error('User ID not found or invalid in token');
      return null;  // ถ้าไม่มี id ใน token, return null
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

    return this.http.post<any>(this.productAdminUrl, formData);
  }

  // ฟังก์ชัน logout สำหรับลบ token และเปลี่ยนเส้นทาง
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {  // ตรวจสอบว่าเป็นเบราว์เซอร์ก่อนเข้าถึง localStorage
      const userId = this.getUserId();
      if (userId) {
        localStorage.removeItem(`cart_${userId}`);  // ลบข้อมูล cart ของผู้ใช้จาก localStorage
      }
      localStorage.removeItem('token');  // ลบ token ออกจาก localStorage
    }
    this.router.navigate(['/login']).catch(err => {
      console.error('Error navigating to login:', err);  // ตรวจสอบข้อผิดพลาดในการเปลี่ยนหน้า
    });
  }

  // ฟังก์ชันสำหรับดึงบทบาทของผู้ใช้
  getUserRole(): string {
    const token = this.getToken(); // ดึง token
    if (!token) return ''; // คืนค่าว่างถ้าไม่มี token
    const decoded = this.decodeJWT(token); // ถอดรหัส JWT
    return decoded?.role || ''; // คืนค่าบทบาทจาก decoded payload
  }
}
