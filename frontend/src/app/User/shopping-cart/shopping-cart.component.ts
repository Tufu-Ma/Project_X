import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../auth.service';
@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {
  cartItems: any[] = [];
  totalItems: number = 0;
  totalAmount: number = 0;

  constructor(private cartService: CartService, private authService: AuthService) { }


  ngOnInit(): void {
    this.loadCart();  // โหลดข้อมูลตะกร้าสินค้าเมื่อเปิดหน้า
  }

  loadCart() {
    const userId = parseInt(this.authService.getUserId() || '0', 10);  // แปลง string เป็น number
    
    if (userId) {
      this.cartService.getCartItems(userId).subscribe((items: any[]) => {
        this.cartItems = items;
        console.log('Loaded cart items:', this.cartItems);
        this.calculateTotals();
      });
    } else {
      console.log('User is not logged in or UserId is missing.');
    }
  }  

  calculateTotals() {
    this.totalItems = this.cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);  // คำนวณจำนวนสินค้าทั้งหมด
    this.totalAmount = this.cartItems.reduce((sum, item) => sum + (item.Price * item.quantity || 0), 0);  // คำนวณยอดรวมของสินค้าในตะกร้า

    // เพิ่ม log เพื่อตรวจสอบผลลัพธ์การคำนวณ
    console.log('Total items:', this.totalItems);
    console.log('Total amount:', this.totalAmount);
  }


  increaseQuantity(product: any) {
    product.quantity += 1;
    this.cartService.updateQuantity(product.ProductId, product.quantity);  // อัปเดตจำนวนสินค้าในตะกร้า
    this.calculateTotals();
  }

  decreaseQuantity(product: any) {
    if (product.quantity > 1) {
      product.quantity -= 1;
      this.cartService.updateQuantity(product.ProductId, product.quantity);  // ลดจำนวนสินค้าในตะกร้า
      this.calculateTotals();
    }
  }

  updateQuantity(product: any) {
    if (product.quantity > 0) {
      this.cartService.updateQuantity(product.ProductId, product.quantity);  // อัปเดตจำนวนสินค้าในตะกร้า
      this.calculateTotals();
    }
  }

  // ฟังก์ชันลบสินค้าจากตะกร้า
  removeItem(product: any) {
    this.cartService.removeFromCart(product.ProductId);  // ลบสินค้าออกจากตะกร้า
    this.loadCart();  // โหลดข้อมูลตะกร้าใหม่
  }

  placeOrder() {
    alert('Order placed successfully!');
    this.cartService.clearCart();  // ล้างตะกร้าสินค้าเมื่อสั่งซื้อเสร็จสิ้น
    this.loadCart();
  }
}
