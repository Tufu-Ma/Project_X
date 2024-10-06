import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service'; // นำเข้า ProductService
import { AuthService } from '../../auth.service';  // ใช้ AuthService สำหรับตรวจสอบการล็อกอิน
import { HeaderService } from '../../services/header.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  searchTerm: string = '';  // เพิ่มตัวแปร searchTerm
  suggestions: any[] = [];  // เพิ่มตัวแปร suggestions
  isAdmin: boolean = false;

  // Inject ProductService, Router และ ChangeDetectorRef เข้ามาใน constructor
  constructor(
    public authService: AuthService,
    private router: Router,
    private productService: ProductService,
    private headerService: HeaderService,
    private cd: ChangeDetectorRef // เพิ่ม ChangeDetectorRef เพื่อบังคับการตรวจสอบ
  ) {}

  ngOnInit() {
    // ตรวจสอบบทบาทของผู้ใช้จาก AuthService
    const userRole = this.authService.getUserRole();
    this.isAdmin = userRole === 'Admin'; // เปลี่ยนเป็น true ถ้าเป็น Admin
    
    // เช็คจาก HeaderService ถ้าใช้
    this.headerService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
      this.cd.detectChanges(); // บังคับให้ Angular ตรวจสอบการเปลี่ยนแปลง
    });
  }

  // ฟังก์ชัน onSearchInput ที่ทำงานเมื่อผู้ใช้พิมพ์ในแถบค้นหา
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

  // ฟังก์ชัน onSearch สำหรับการทำงานเมื่อผู้ใช้กดค้นหา
  onSearch(): void {
    if (this.searchTerm) {
      this.router.navigate(['/product-list'], { queryParams: { search: this.searchTerm } });
      this.suggestions = [];
    }
  }

  // ฟังก์ชัน selectSuggestion สำหรับเลือกสินค้าจากรายการแนะนำ
  selectSuggestion(suggestion: any): void {
    this.searchTerm = suggestion.ProductName;
    this.onSearch();
  }

  // ฟังก์ชัน logout สำหรับการล็อกเอาต์
  logout(): void {
    this.authService.logout();  // ล้างข้อมูลการล็อกอิน
    this.headerService.setAdminStatus(false); // รีเซ็ตสถานะผู้ดูแลระบบ
    this.router.navigate(['/login']);  // นำผู้ใช้กลับไปที่หน้า login
  }  
}
