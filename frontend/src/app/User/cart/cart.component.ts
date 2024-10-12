import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  userId: number = 0;
  cartItems: any[] = [];
  total: number = 0;

  constructor(private cartService: CartService, private authService: AuthService) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userId = userId;
      this.getCartItems();
    } else {
      console.error('User is not logged in or token is missing');
    }
  }

  // ดึงข้อมูลสินค้าจากรถเข็น
  getCartItems(): void {
    this.cartService.getCart(this.userId).subscribe(
      (items) => {
        console.log('Cart items received from service:', items);
        this.cartItems = items;
        this.calculateTotal(); // คำนวณยอดรวมหลังจากดึงข้อมูลสินค้า
      },
      (error) => {
        console.error('Error fetching cart items', error);
      }
    );
  }

  // อัปเดตจำนวนสินค้าในรถเข็น
  updateCartItem(cartId: number, quantity: number): void {
    if (!cartId || quantity <= 0) {
      console.error('Invalid cartId or quantity:', cartId, quantity);
      return;
    }

    this.cartService.updateCart(cartId, quantity).subscribe(
      response => {
        console.log('Cart updated successfully:', response);
        this.getCartItems(); // โหลดข้อมูลรถเข็นใหม่หลังจากอัปเดตสำเร็จ
      },
      error => {
        console.error('Error updating cart:', error);
      }
    );
  }

  // ลบสินค้าออกจากรถเข็น
  removeItem(cartId: number): void {
    if (!cartId) {
      console.error('Invalid CartId:', cartId);
      return;
    }

    this.cartService.removeFromCart(cartId).subscribe(
      () => {
        // อัปเดตข้อมูลหลังจากลบสินค้าออกจากรถเข็น
        this.cartItems = this.cartItems.filter(item => item.CartId !== cartId);
        this.calculateTotal(); // คำนวณยอดรวมใหม่หลังจากลบสินค้าออก
      },
      (error) => {
        console.error('Error removing item from cart:', error);
      }
    );
  }

  // คำนวณราคาสินค้ารวมทั้งหมดในรถเข็น
  calculateTotal(): void {
    this.total = this.cartItems.reduce((sum, item) => sum + item.Price * item.Quantity, 0);
  }

  // ทำการ checkout
  checkout(): void {
    const itemsToCheckout = this.cartItems.map((item) => ({
      productId: item.ProductId,
      quantity: item.Quantity,
    }));
  
    // ตรวจสอบข้อมูลก่อนส่งไป backend
    console.log('Items to checkout:', itemsToCheckout);
  
    this.cartService.checkout(this.userId, itemsToCheckout).subscribe(
      () => {
        alert('Checkout successful');
        this.cartItems = [];
        this.total = 0;
      },
      (error) => {
        console.error('Error during checkout', error);
      }
    );
  }

  // เพิ่มจำนวนสินค้า
  increaseQuantity(item: any) {
    item.Quantity++;
    this.updateCartItem(item.CartId, item.Quantity); // อัปเดตจำนวนสินค้าในรถเข็น
  }

  // ลดจำนวนสินค้า
  decreaseQuantity(item: any) {
    if (item.Quantity > 1) {
      item.Quantity--;
      this.updateCartItem(item.CartId, item.Quantity); // อัปเดตจำนวนสินค้าในรถเข็น
    }
  }
}
