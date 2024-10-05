import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service'; // นำเข้า ProductService
import { AuthService } from '../../auth.service';  // ใช้ AuthService สำหรับตรวจสอบการล็อกอิน

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent {
  searchTerm: string = '';  // เพิ่มตัวแปร searchTerm
  suggestions: any[] = [];  // เพิ่มตัวแปร suggestions

  constructor(public authService: AuthService, private router: Router, private productService: ProductService) {}

  onSearchInput(): void {
    if (this.searchTerm.length > 2) {
      this.productService.getProductSuggestions(this.searchTerm).subscribe(
        (data: any[]) => {
          this.suggestions = data;
        },
        (error: any) => {
          console.error('Error fetching suggestions:', error);
        }
      );
    } else {
      this.suggestions = [];
    }
  }

  onSearch(): void {
    if (this.searchTerm) {
      this.router.navigate(['/admin/products'], { queryParams: { search: this.searchTerm } });
      this.suggestions = [];
    }
  }

  logout(): void {
    this.authService.logout();  // ล้างข้อมูลการล็อกอิน
    this.router.navigate(['/login']);  // นำผู้ใช้กลับไปที่หน้า login
  }
}
