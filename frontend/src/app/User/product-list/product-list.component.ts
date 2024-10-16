import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: any[] = [];  // เก็บรายการสินค้าทั้งหมด
  categories: any[] = [];  // เก็บรายการหมวดหมู่
  selectedCategoryIds: number[] = [];  // เก็บ CategoryId ที่ถูกเลือก (แบบ array)
  searchTerm: string = '';  // เก็บค่าคำค้นหาที่ส่งมาจาก header
  groupedProducts: { [key: string]: any[] } = {};  // แยกสินค้าตามหมวดหมู่

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || '';  // รับค่าจาก query param 'search' ที่มาจาก header
      this.getCategories();  // เรียกดึงหมวดหมู่
      this.getProducts();  // ดึงสินค้าทั้งหมดในครั้งแรก
    });
  }

  // ดึงหมวดหมู่ทั้งหมดจาก ProductService
  getCategories(): void {
    this.productService.getCategories().subscribe(
      response => {
        this.categories = response;
      },
      error => {
        console.error('Error fetching categories:', error);
      }
    );
  }

  // ดึงสินค้าทั้งหมดหรือสินค้าตามหมวดหมู่ที่เลือก
  getProducts(): void {
    this.productService.getProducts().subscribe(
      response => {
        this.products = response;  // เก็บข้อมูลสินค้าที่ได้รับจาก API
        this.filterProducts(); // กรองสินค้าตามหมวดหมู่และคำค้นหาที่เลือก
      },
      error => {
        console.error('Error fetching products:', error);
      }
    );
  }

  // ฟังก์ชันสำหรับกรองสินค้าตามหมวดหมู่และคำค้นหาที่เลือก
  filterProducts(): void {
    let filteredProducts = this.products;

    // ถ้ามีคำค้นหา ให้กรองสินค้าตามคำค้นหา
    if (this.searchTerm.trim() !== '') {
      filteredProducts = filteredProducts.filter(product =>
        product.ProductName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // ถ้ามีการเลือกหมวดหมู่ ให้กรองสินค้าตามหมวดหมู่ที่เลือก
    if (this.selectedCategoryIds.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        this.selectedCategoryIds.includes(product.CategoryId)
      );
    }

    // แสดงสินค้าทั้งหมดถ้าไม่มีการเลือกหมวดหมู่และไม่มีคำค้นหา
    this.groupProductsByCategory(filteredProducts);
  }

  // ฟังก์ชันสำหรับแยกสินค้าตามหมวดหมู่
  groupProductsByCategory(filteredProducts: any[]): void {
    this.groupedProducts = filteredProducts.reduce((groups: any, product: any) => {
      const category = this.categories.find(c => c.CategoryId === product.CategoryId);
      const categoryName = category ? category.CategoryName : 'Other';  // ถ้าไม่มีหมวดหมู่, ใส่ใน 'Other'

      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(product);

      return groups;
    }, {});
  }

  // ฟังก์ชันเมื่อมีการเปลี่ยนหมวดหมู่
  onCategoryChange(event: any): void {
    const selectedCategoryId = Number(event.target.value);

    if (event.target.checked) {
      this.selectedCategoryIds.push(selectedCategoryId); // ถ้าเลือกให้เพิ่ม
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== selectedCategoryId); // ถ้าไม่เลือกให้ลบ
    }

    this.filterProducts();  // กรองสินค้าตามหมวดหมู่และคำค้นหาที่เลือก
  }

  // ฟังก์ชันสำหรับนำทางไปยังหน้ารายละเอียดสินค้า
  goToProductDetail(productId: number): void {
    this.router.navigate(['/product-detail', productId]);  // นำทางไปยังหน้ารายละเอียดสินค้า
  }

  // ฟังก์ชันสำหรับดึง URL ของภาพสินค้า
  getImageUrl(imageUrl: string): string {
    return imageUrl ? `http://localhost:3000${imageUrl}` : 'assets/default.jpg';
  }

  // ฟังก์ชันจัดการเมื่อภาพสินค้าไม่สามารถโหลดได้
  onImageError(event: any): void {
    event.target.src = 'assets/default.jpg';  // ใช้ default.jpg เมื่อภาพไม่สามารถโหลดได้
  }
}
