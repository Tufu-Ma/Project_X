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

  // ดึงข้อมูลยอดขายรวม (ไม่รวมคำสั่งซื้อที่ถูกยกเลิก)
  getTotalSales(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sales-summary?excludeCancelled=true`); // เพิ่ม query parameter excludeCancelled
  }

  // ดึงข้อมูลสินค้าที่ขายดีที่สุด (ไม่รวมคำสั่งซื้อที่ถูกยกเลิก)
  getBestSellingProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/best-selling-products?excludeCancelled=true`); // เพิ่ม query parameter excludeCancelled
  }

  // ดึงข้อมูลสินค้าที่ขายได้น้อยที่สุด (ไม่รวมคำสั่งซื้อที่ถูกยกเลิก)
  getWorstSellingProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/worst-selling-products?excludeCancelled=true`); // เพิ่ม query parameter excludeCancelled
  }
}
