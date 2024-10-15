import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: any; // ข้อมูลสินค้า
  quantity: number = 1;  // เริ่มต้นด้วย 1 ชิ้น
  isOutOfStock: boolean = false; // สถานะบอกว่าสินค้าหมดหรือไม่

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(+productId).subscribe(
        response => {
          this.product = response;
          this.checkStockStatus(); // ตรวจสอบสถานะสินค้าว่าหมดหรือไม่

          // ตั้งค่า quantity เป็น 0 ถ้าสต็อกเป็น 0
        if (this.product.Stock === 0) {
          this.quantity = 0; // ตั้งค่า quantity เป็น 0
          this.isOutOfStock = true; // กำหนดให้แสดงสถานะ Out of Stock
        }
        },
        error => {
          console.error('Error fetching product details:', error);
        }
      );
    }
  }

  // ตรวจสอบสถานะสต็อก
  checkStockStatus(): void {
    if (this.product.Stock <= 0) {
      this.isOutOfStock = true;
    }
  }

  // ฟังก์ชันเพิ่มสินค้าในตะกร้า
  addToCart(): void {
    if (!this.authService.isLoggedIn()) {
      Swal.fire({
        title: 'ไม่สามารถเพิ่มสินค้าได้',
        text: 'กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าในตะกร้า',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    // ตรวจสอบว่าสินค้ามี stock พอสำหรับการเพิ่มสินค้าหรือไม่
    if (this.quantity > this.product.Stock) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'สินค้ามีจำนวนในคลังไม่เพียงพอ',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    // เตรียมข้อมูลที่จะส่งไปยัง backend
    const productToAdd = {
      userId: userId,
      productId: this.product.ProductId,
      productName: this.product.ProductName || 'Unnamed Product',
      price: this.product.Price,
      imageUrl: this.product.ImageUrl || '',  
      quantity: this.quantity
    };

    console.log('Data sent to API:', productToAdd);

    this.cartService.addToCart(productToAdd).subscribe(
      () => {
        Swal.fire({
          title: 'สำเร็จ!',
          text: `คุณได้เพิ่ม ${this.quantity} ชิ้นของ ${this.product.ProductName} ลงในตะกร้าสินค้าแล้ว`,
          icon: 'success',
          confirmButtonText: 'ตกลง'
        });
        // ไม่เรียก updateStock() เพื่อไม่ให้ลด stock
      },
      (error) => {
        console.error('Error adding product to cart:', error);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถเพิ่มสินค้าในตะกร้าได้ กรุณาลองใหม่อีกครั้ง',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
      }
    );
  }

  // ฟังก์ชันลดจำนวนสต็อกหลังจากเพิ่มสินค้าลงตะกร้า
  updateStock(): void {
    this.product.Stock -= this.quantity; // ลดสต็อก
    if (this.product.Stock <= 0) {
      this.isOutOfStock = true; // ถ้าสต็อกหมด ให้แสดงว่า Out of Stock
    }
  }

  // ฟังก์ชันอัปเดตจำนวนสินค้า
updateQuantity(amount: number): void {
  if (this.product.Stock === 0) {
    this.quantity = 0;  // ถ้าสต็อกเป็น 0 ตั้งค่า quantity เป็น 0
    return; // ออกจากฟังก์ชัน
  }

  this.quantity += amount;

  if (this.quantity < 1) {
    this.quantity = 1;  // ป้องกันไม่ให้จำนวนสินค้าน้อยกว่า 1
  } else if (this.quantity > this.product.Stock) {
    this.quantity = this.product.Stock; // จำกัดจำนวนไม่ให้เกิน stock
  }
}


  // ฟังก์ชันสำหรับดึง URL ของภาพสินค้า
  getImageUrl(imageUrl: string): string {
    return imageUrl ? `http://localhost:3000${imageUrl}` : 'assets/default.jpg';
  }
}
