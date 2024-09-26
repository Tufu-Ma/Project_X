import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth.service';  // นำเข้า AuthService
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';  // import Observable และ of

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItems.asObservable();
  private apiUrl = 'http://localhost:3000/cart'; // URL ของ API สำหรับตะกร้าสินค้า

  constructor(private authService: AuthService, private http: HttpClient) {
    // ดึงข้อมูลตะกร้าของผู้ใช้เมื่อเริ่มต้น ถ้ามีการล็อกอินอยู่
    if (this.authService.isLoggedIn()) {
      this.loadCartForUser();
    }
  }

  // ฟังก์ชันสำหรับการโหลดตะกร้าของผู้ใช้ที่ล็อกอิน
  private loadCartForUser(): void {
    const userId = this.authService.getUserId(); // ตรวจสอบการดึง UserId
    console.log('UserId loaded:', userId);  // log เพื่อเช็คว่าดึง userId ได้ไหม
    if (userId) {
      this.http.get<any[]>(`${this.apiUrl}/${userId}`).subscribe((data) => {
        this.cartItems.next(data);
        console.log('Loaded cart items from API:', data);
      }, (error) => {
        console.error('Error loading cart items from API:', error);
      });
    }
  }

  // เพิ่มสินค้าไปยังตะกร้า
  addToCart(product: { ProductId: any; ProductName: any; Price: any; ImageUrl: any; quantity: number }) {
    const userId = this.authService.getUserId();  // ดึง userId เพื่อใช้ในการจัดการ cart
    if (!userId) {
      console.log('ไม่สามารถเพิ่มสินค้าได้: ไม่มี UserId');
      return;  // ถ้าไม่มี userId ไม่ดำเนินการต่อ
    }

    const itemToAdd = {
      userId,
      productId: product.ProductId,
      quantity: product.quantity
    };

    this.http.post(`${this.apiUrl}`, itemToAdd).subscribe(() => {
      let items = [...this.cartItems.value];
      const itemIndex = items.findIndex(item => item.ProductId === product.ProductId);

      if (itemIndex === -1) {
        // เพิ่มสินค้าใหม่ในตะกร้า
        items.push({
          ProductId: product.ProductId,
          ProductName: product.ProductName,
          Price: product.Price,
          ImageUrl: product.ImageUrl,
          quantity: product.quantity
        });
      } else {
        // เพิ่มจำนวนของสินค้าที่มีอยู่ในตะกร้า
        items[itemIndex].quantity += product.quantity;
      }

      this.cartItems.next(items);
      this.saveCartForUser(items);  // บันทึกตะกร้าใน localStorage สำหรับผู้ใช้ปัจจุบัน
      console.log('Updated cart items:', items);
    }, (error) => {
      console.error('Error adding item to cart in API:', error);
    });
  }

  // บันทึกข้อมูลตะกร้าสำหรับผู้ใช้ปัจจุบันลงใน localStorage
  private saveCartForUser(items: any[]): void {
    const userId = this.authService.getUserId(); // ใช้ user ID เป็นคีย์ใน localStorage
    if (!userId) {
      console.log('ไม่สามารถบันทึกสินค้าได้: ไม่มี UserId');
      return;  // ถ้าไม่มี userId ไม่ดำเนินการต่อ
    }
    localStorage.setItem(`cart_${userId}`, JSON.stringify(items));
    console.log(`Cart saved for userId: ${userId}`);
  }

  // ดึงข้อมูลสินค้าจากตะกร้า
  getCartItems(userId: number): Observable<any[]> {  // ระบุประเภทให้เป็น Observable<any[]>
    return this.http.get<any[]>(`http://localhost:3000/cart/${userId}`)
      .pipe(
        catchError((error: any) => {
          console.error('Error loading cart items from API:', error);
          return of([]);  // ส่งกลับ array ว่างในกรณีที่เกิด error
        })
      );
  }
  

  // อัปเดตจำนวนสินค้า
  updateQuantity(productId: number, quantity: number) {
    const userId = this.authService.getUserId();
    if (!userId) return;

    const updateItem = { userId, productId, quantity };

    this.http.put(`${this.apiUrl}/${productId}`, updateItem).subscribe(() => {
      let items = [...this.cartItems.value];
      const itemIndex = items.findIndex(item => item.ProductId === productId);

      if (itemIndex !== -1) {
        if (quantity > 0) {
          items[itemIndex].quantity = quantity;
        } else {
          items.splice(itemIndex, 1); // ถ้าจำนวนเป็น 0 ให้ลบสินค้าออก
        }
        this.cartItems.next(items);
        this.saveCartForUser(items);  // อัปเดตตะกร้าใน localStorage สำหรับผู้ใช้ปัจจุบัน
      }
    }, (error) => {
      console.error('Error updating cart in API:', error);
    });
  }

  // ลบสินค้าจากตะกร้า
  removeFromCart(productId: number) {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.http.delete(`${this.apiUrl}/${productId}`).subscribe(() => {
      let items = [...this.cartItems.value];
      items = items.filter(item => item.ProductId !== productId);
      this.cartItems.next(items);
      this.saveCartForUser(items);  // อัปเดตตะกร้าใน localStorage
    }, (error) => {
      console.error('Error removing item from cart in API:', error);
    });
  }

  // ล้างตะกร้าสินค้า
  clearCart() {
    this.cartItems.next([]);
    const userId = this.authService.getUserId();
    if (userId) {
      this.http.delete(`${this.apiUrl}/clear/${userId}`).subscribe(() => {
        localStorage.removeItem(`cart_${userId}`);  // ลบข้อมูลใน localStorage สำหรับ user ปัจจุบัน
        console.log(`Cleared cart for userId: ${userId}`);
      }, (error) => {
        console.error('Error clearing cart in API:', error);
      });
    }
  }
}
