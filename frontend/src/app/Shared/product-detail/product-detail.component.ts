import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';

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
    private cartService: CartService
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
  
    const productToAdd = {
      ProductId: this.product.ProductId,
      ProductName: this.product.ProductName,
      Price: this.product.Price,
      ImageUrl: this.product.ImageUrl,
      quantity: this.quantity // ใช้ค่า quantity ที่ผู้ใช้เลือก
    };
    
    this.cartService.addToCart(productToAdd);  // เรียกใช้แบบ object
    Swal.fire({
      title: 'สำเร็จ!',
      text: `คุณได้เพิ่ม ${this.quantity} ชิ้นของ ${this.product.name} ลงในตะกร้าสินค้าแล้ว`,
      icon: 'success',
      confirmButtonText: 'ตกลง'
    });
  }    
  
  updateQuantity(amount: number): void {
    this.quantity += amount;
    if (this.quantity < 1) {
      this.quantity = 1;  // Prevent quantity from being less than 1
    }
  }  
}
