import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  recommendedProducts: any[] = [];

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(): void {
    this.productService.getProducts().subscribe(
      (response) => {
        this.products = response.slice(0, 8); // แสดงสินค้าหลัก 8 รายการ
        this.recommendedProducts = response.slice(8, 12); // แสดงสินค้าแนะนำ 4 รายการ
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  goToProductDetail(productId: number): void {
    this.router.navigate(['/product-detail', productId]);
  }

  onImageError(event: any): void {
    event.target.src = 'assets/default.jpg';
  }

  getImageUrl(imageUrl: string): string {
    return imageUrl ? `http://localhost:3000${imageUrl}` : 'assets/default.jpg';
  }
}
