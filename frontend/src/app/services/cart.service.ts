import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  getCartItems(arg0: number) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://localhost:3000/cart'; // URL ของ API

  constructor(private http: HttpClient) {}

  // ฟังก์ชันดึงข้อมูลรถเข็นของผู้ใช้
  getCart(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`);
  }  

  // ฟังก์ชันเพิ่มสินค้าในรถเข็น
  addToCart(cartItem: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, cartItem);
  }

  // ฟังก์ชันอัปเดตจำนวนสินค้าในรถเข็น
  updateCart(cartId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${cartId}`, { quantity });
  }

  // ฟังก์ชันลบสินค้าจากรถเข็น
  removeFromCart(cartId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${cartId}`);
  }

  // ฟังก์ชัน checkout
  checkout(userId: number, items: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkout`, { userId, items });
  }
}
