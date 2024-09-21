import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service'; // นำเข้า CartService

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  products: any[] = [];

  constructor(private productService: ProductService, private cartService: CartService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
    });    
  }

  addToCart(product: any): void {
    // เรียกใช้ CartService เพื่อเพิ่มสินค้าลงในตะกร้า
    this.cartService.addToCart(product);
    console.log('Product added to cart:', product);
  }
  }

