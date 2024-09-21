import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      // ใช้งาน localStorage เฉพาะใน browser environment เท่านั้น
      const token = localStorage.getItem('token');
      if (token) {
        return true;
      }
      this.router.navigate(['/login']);
      return false;
    } else {
      // ถ้าไม่ใช่ browser environment ให้รีเทิร์น false หรือค่าเริ่มต้นอื่นๆ
      return false;
    }
  }
}
