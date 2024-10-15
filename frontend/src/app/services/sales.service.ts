import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private apiUrl = 'http://localhost:3000/chart'; // URL ของ API

  constructor(private http: HttpClient) {}

  getTotalSales(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sales-summary?startDate=${startDate}&endDate=${endDate}`);
  }
  
  // ดึงข้อมูลสินค้าที่ขายดีที่สุด (ไม่รวมคำสั่งซื้อที่ถูกยกเลิก)
  getBestSellingProducts(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/best-selling-products?startDate=${startDate}&endDate=${endDate}`);
  }

  // ดึงข้อมูลสินค้าที่ขายได้น้อยที่สุด (ไม่รวมคำสั่งซื้อที่ถูกยกเลิก)
  getWorstSellingProducts(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/worst-selling-products?startDate=${startDate}&endDate=${endDate}`);
  }

  // ฟังก์ชันสำหรับดาวน์โหลดไฟล์ Excel
  downloadSalesReport(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/download?startDate=${startDate}&endDate=${endDate}`, { responseType: 'blob' }); // ใช้ responseType เป็น 'blob'
  }
}
