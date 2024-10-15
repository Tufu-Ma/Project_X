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
  searchTerm: string = '';  // ตัวแปรสำหรับคำค้นหา
  suggestions: any[] = [];  // ตัวแปรสำหรับเก็บคำแนะนำ
  isAdmin: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private productService: ProductService,
    private headerService: HeaderService,
    private cd: ChangeDetectorRef // ใช้สำหรับบังคับการตรวจสอบ
  ) {}

  ngOnInit() {
    const userRole = this.authService.getUserRole();
    this.isAdmin = userRole === 'Admin'; // ตรวจสอบว่าผู้ใช้เป็น Admin หรือไม่

    this.headerService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
      this.cd.detectChanges(); // ตรวจสอบการเปลี่ยนแปลง
    });
  }

  // ฟังก์ชันสำหรับการค้นหาเมื่อกดปุ่มค้นหา
  onSearch(): void {
    if (this.searchTerm) {
      this.router.navigate(['/product-list'], { queryParams: { search: this.searchTerm } }); // ส่งคำค้นหาไปที่หน้า product-list พร้อม query params
      this.suggestions = []; // เคลียร์คำแนะนำ
    } else {
      // หากไม่มีคำค้นหาให้แสดงสินค้าทั้งหมด
      this.router.navigate(['/product-list']);
    }
  }

  // ฟังก์ชันสำหรับการค้นหาแบบเรียลไทม์
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

  // ฟังก์ชันสำหรับเลือกคำแนะนำ
  selectSuggestion(suggestion: any): void {
    this.searchTerm = suggestion.ProductName;
    this.onSearch(); // ทำการค้นหาหลังจากเลือกคำแนะนำ
  }

  // ฟังก์ชันสำหรับการล็อกเอาต์
  logout(): void {
    this.authService.logout();  // ล้างข้อมูลการล็อกอิน
    this.headerService.setAdminStatus(false); // รีเซ็ตสถานะผู้ดูแลระบบ
    this.router.navigate(['/login']);  // นำผู้ใช้กลับไปที่หน้า login
  }
}
