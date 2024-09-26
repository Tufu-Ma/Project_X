import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth.service';  // นำเข้า AuthService

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: any;
  selectedColor: string = '';
  quantity: number = 1;  // เริ่มต้นด้วย 1 ชิ้น
  availableColors: string[] = ['Red', 'Blue', 'Green', 'Black', 'White'];  // สีที่มีให้เลือก

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService  // ใช้ AuthService
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

  addToCart(): void {
    console.log('Is user logged in:', this.authService.isLoggedIn()); // ตรวจสอบสถานะล็อกอิน
  
    if (!this.authService.isLoggedIn()) {
      Swal.fire({
        title: 'ไม่สามารถเพิ่มสินค้าได้',
        text: 'กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าในตะกร้า',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      return;  // ออกจากฟังก์ชัน ถ้าไม่ได้ล็อกอิน
    }
  
    const productToAdd = {
      ProductId: this.product.ProductId,
      ProductName: this.product.ProductName,
      Price: this.product.Price,
      ImageUrl: this.product.ImageUrl,
      quantity: this.quantity
    };
  
    this.cartService.addToCart(productToAdd);  // เรียกใช้ CartService
    Swal.fire({
      title: 'สำเร็จ!',
      text: `คุณได้เพิ่ม ${this.quantity} ชิ้นของ ${this.product.ProductName} ลงในตะกร้าสินค้าแล้ว`,
      icon: 'success',
      confirmButtonText: 'ตกลง'
    });
  }
  

  updateQuantity(amount: number): void {
    this.quantity += amount;
    if (this.quantity < 1) {
      this.quantity = 1;  // ป้องกันไม่ให้ quantity น้อยกว่า 1
    }
  }  
}
