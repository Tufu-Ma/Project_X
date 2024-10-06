import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  private apiUrl = 'http://localhost:3000/chart';  // URL ของ API

  constructor(private http: HttpClient) { }

  // ฟังก์ชันเพื่อดึงข้อมูล OrderItems
  getOrderItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/order-items`);
  }

  // ฟังก์ชันเพื่อดึงสินค้าที่ขายดีที่สุด
  getBestSellingProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/best-selling-products`);
  }

  // ฟังก์ชันเพื่อดึงสินค้าที่ขายได้น้อยที่สุด
  getWorstSellingProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/worst-selling-products`);
  }
}
