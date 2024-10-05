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
  product: any;
  selectedColor: string = '';
  quantity: number = 1;  // เริ่มต้นด้วย 1 ชิ้น

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
        },
        error => {
          console.error('Error fetching product details:', error);
        }
      );
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

  // เตรียมข้อมูลที่จะส่งไปยัง backend
  const productToAdd = {
    userId: userId,
    productId: this.product.ProductId,
    productName: this.product.ProductName || 'Unnamed Product', // แก้ไขส่วนนี้เพื่อไม่ให้เป็น null
    price: this.product.Price,
    imageUrl: this.product.ImageUrl || '',  // ตรวจสอบค่า imageUrl ด้วย
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




  // ฟังก์ชันอัปเดตจำนวนสินค้า
  updateQuantity(amount: number): void {
    this.quantity += amount;
    if (this.quantity < 1) {
      this.quantity = 1;  // ป้องกันไม่ให้จำนวนสินค้าน้อยกว่า 1
    }
  }
}
