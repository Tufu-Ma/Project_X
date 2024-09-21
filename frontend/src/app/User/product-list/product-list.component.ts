import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: any[] = [];  // เก็บรายการสินค้าทั้งหมด
  filteredProducts: any[] = [];  // เก็บรายการสินค้าหลังจากการกรอง
  searchTerm: string = '';  // เก็บค่าคำค้นหา

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // รับค่าคำค้นหาจาก query params
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || '';  // รับค่าจาก query param 'search'
      this.getProducts();  // เรียกการดึงสินค้าจาก API
    });
  }

  // ดึงสินค้าทั้งหมดจาก ProductService
  getProducts(): void {
    this.productService.getProducts().subscribe(
      response => {
        this.products = response;  // เก็บข้อมูลสินค้าที่ได้รับจาก API
        this.filterProducts();  // กรองสินค้าตามคำค้นหา
      },
      error => {
        console.error('Error fetching products:', error);
      }
    );
  }

  // ฟังก์ชันกรองสินค้าตามคำค้นหา
  filterProducts(): void {
    if (this.searchTerm) {
      this.filteredProducts = this.products.filter(product =>
        (product.ProductName ? product.ProductName.toLowerCase().includes(this.searchTerm.toLowerCase()) : false) ||
        (product.Brand ? product.Brand.toLowerCase().includes(this.searchTerm.toLowerCase()) : false) ||
        (product.Model ? product.Model.toLowerCase().includes(this.searchTerm.toLowerCase()) : false)
      );
    } else {
      this.filteredProducts = this.products;  // ถ้าไม่มีคำค้นหา ให้แสดงสินค้าทั้งหมด
    }
  }

  // ฟังก์ชันสำหรับนำทางไปยังหน้ารายละเอียดสินค้า
  goToProductDetail(productId: number): void {
    this.router.navigate(['/product-detail', productId]);  // นำทางไปยังหน้ารายละเอียดสินค้า
  }

  // ฟังก์ชันสำหรับเพิ่มสินค้าลงในตะกร้า
  addToCart(product: any): void {
    const productToAdd = {
      ProductId: product.ProductId,  // ต้องมี ProductId
      ProductName: product.ProductName,  // ต้องมี ProductName
      Price: product.Price,  // ต้องมี Price
      ImageUrl: product.ImageUrl,  // ต้องมี ImageUrl
      quantity: 1  // เริ่มต้นที่จำนวน 1
    };
  
    // ตรวจสอบข้อมูลสินค้าก่อนเพิ่มลงในตะกร้า
    if (!productToAdd.ProductId || !productToAdd.ProductName || !productToAdd.Price || !productToAdd.ImageUrl) {
      console.error('Some product details are missing:', productToAdd);
      return;
    }

    // เพิ่มสินค้าไปยัง CartService
    this.cartService.addToCart(productToAdd);
    alert(`${product.ProductName} ถูกเพิ่มลงในตะกร้าแล้ว`);
  }
}
