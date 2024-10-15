import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/categories'; // URL ของ API

  constructor(private http: HttpClient) {}

  // ดึงหมวดหมู่ที่มีสถานะ Active
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // เพิ่มหมวดหมู่ใหม่
  addCategory(category: { CategoryName: string, Status: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, category);
  }

  // อัปเดตสถานะหมวดหมู่
  updateCategory(categoryId: number, updateData: { Status: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${categoryId}`, updateData);
  }
}
