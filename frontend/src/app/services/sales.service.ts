// sales.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private apiUrl = 'http://localhost:3000/chart'; // URL ของ API

  constructor(private http: HttpClient) {}

  // ดึงข้อมูลยอดขายรวม
  getTotalSales(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sales-summary`); // ตรวจสอบ URL ให้ถูกต้อง
  }  

  // ดึงข้อมูลสินค้าที่ขายดีที่สุด
  getBestSellingProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/best-selling-products`);
  }

  // ดึงข้อมูลสินค้าที่ขายได้น้อยที่สุด
  getWorstSellingProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/worst-selling-products`);
  }
}
