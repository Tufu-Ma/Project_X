import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  private apiUrl = 'http://localhost:3000/products';
  private categoriesUrl = 'http://localhost:3000/categories';

  constructor(private http: HttpClient) { }

  // ฟังก์ชันสำหรับดึงสินค้าทั้งหมด
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);  // ไม่ต้องรับพารามิเตอร์
  }

  // ฟังก์ชันสำหรับดึงสินค้าตาม ID
  getProductById(productId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${productId}`);
  }

  // เพิ่มสินค้า
  addProduct(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // อัปเดตสินค้า
  updateProduct(productId: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productId}`, formData);
  }

  // ลบสินค้า
  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`);
  }

  // ฟังก์ชันสำหรับดึงรายการสินค้าตามคำที่กำลังพิมพ์
  getProductSuggestions(searchTerm: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/suggestions?search=${searchTerm}`);
  }

  // ฟังก์ชันสำหรับดึงหมวดหมู่ทั้งหมด
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.categoriesUrl);  // URL สำหรับดึงหมวดหมู่
  }

  /// ฟังก์ชันสำหรับดึงสินค้าตามหมวดหมู่
getProductsByCategory(categoryIds: number[]): Observable<any[]> {
  // สร้าง query string สำหรับ ID ที่ส่งเป็น array
  const ids = categoryIds.join(',');
  return this.http.get<any[]>(`${this.apiUrl}/category?ids=${ids}`);
}
}
