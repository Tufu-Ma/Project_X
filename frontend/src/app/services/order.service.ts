import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // นำเข้า HttpHeaders
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private apiUrl = 'http://localhost:3000/orders'; // URL ของ API

  constructor(private http: HttpClient) {}

  // ดึงข้อมูลคำสั่งซื้อทั้งหมด
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // ดึงข้อมูลคำสั่งซื้อตาม ID
  getOrderById(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${orderId}`);
  }

  // ดึงคำสั่งซื้อทั้งหมดตาม UserId
  getOrdersByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`); // ส่ง userId ใน query parameter
  }

  // สร้างคำสั่งซื้อใหม่
  createOrder(orderData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderData);
  }

  // อัปเดตคำสั่งซื้อ (ไม่ใช่สถานะ)
  updateOrder(orderId: number, orderData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}`, orderData);
  }

  // อัปเดตสถานะคำสั่งซื้อ
  updateOrderStatus(orderId: number, OrderStatus: string): Observable<any> {
    const url = `${this.apiUrl}/${orderId}`;  // ใช้เส้นทาง /orders/:id
    const body = { OrderStatus: OrderStatus };  // ส่ง OrderStatus ใน body

    // กำหนด headers ให้เป็น JSON
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put(url, body, { headers });
  }

  // ลบคำสั่งซื้อ
  deleteOrder(orderId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${orderId}`);
  }
}
