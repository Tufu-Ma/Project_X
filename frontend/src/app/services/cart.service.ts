import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductService } from './product.service';  // นำเข้า ProductService

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItems.asObservable();

  constructor(private productService: ProductService) {}  // เพิ่ม ProductService ใน constructor

  // เพิ่มสินค้าไปยังตะกร้า โดยดึงข้อมูลสินค้าจากฐานข้อมูล
  addToCart(product: { ProductId: any; ProductName: any; Price: any; ImageUrl: any; quantity: number }) {
    let items = [...this.cartItems.value];
    const itemIndex = items.findIndex(item => item.ProductId === product.ProductId);
  
    if (itemIndex === -1) {
      // เพิ่มสินค้าใหม่ในตะกร้า พร้อมกับจำนวนที่ระบุ
      items.push({
        ProductId: product.ProductId,
        ProductName: product.ProductName,
        Price: product.Price,
        ImageUrl: product.ImageUrl,
        quantity: product.quantity // จำนวนที่ระบุใน product
      });
    } else {
      // เพิ่มจำนวนของสินค้าที่มีอยู่ในตะกร้า
      items[itemIndex].quantity += product.quantity; // เพิ่มจำนวนที่ระบุ
    }
  
    this.cartItems.next(items);
    console.log('Updated cart items:', items);
  }
  
  

  // ดึงข้อมูลสินค้าจากตะกร้า
  getCartItems() {
    return this.cartItems$;
  }

  // อัปเดตจำนวนสินค้า
  updateQuantity(productId: number, quantity: number) {
    let items = [...this.cartItems.value];
    const itemIndex = items.findIndex(item => item.ProductId === productId);

    if (itemIndex !== -1) {
      if (quantity > 0) {
        items[itemIndex].quantity = quantity; // อัปเดตจำนวน
      } else {
        items.splice(itemIndex, 1); // ถ้าจำนวนเป็น 0 ให้ลบสินค้าออก
      }
      this.cartItems.next(items); // อัปเดตตะกร้า
    }
  }

  // ลบสินค้าจากตะกร้า
  removeFromCart(productId: number) {
    let items = [...this.cartItems.value];
    items = items.filter(item => item.ProductId !== productId); // กรองสินค้าที่จะลบออก
    this.cartItems.next(items);
  }

  // ล้างตะกร้าสินค้า
  clearCart() {
    this.cartItems.next([]); // ล้างตะกร้า
  }
}
