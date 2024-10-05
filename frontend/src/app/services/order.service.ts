import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  // สร้างคำสั่งซื้อใหม่
  createOrder(orderData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderData);
  }

  // อัปเดตสถานะคำสั่งซื้อ
  updateOrder(orderId: number, orderData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}`, orderData);
  }

  // ลบคำสั่งซื้อ
  deleteOrder(orderId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${orderId}`);
  }
}
