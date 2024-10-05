import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductDetailService {
  private apiUrl = 'http://localhost:3000/products'; // URL สำหรับดึงข้อมูลสินค้า

  constructor(private http: HttpClient) {}

  // ฟังก์ชันสำหรับดึงรายละเอียดสินค้า
  getProductDetail(productId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${productId}`).pipe(
      catchError((error: any) => {
        console.error('Error fetching product details', error);
        throw error;
      })
    );
  }
}
