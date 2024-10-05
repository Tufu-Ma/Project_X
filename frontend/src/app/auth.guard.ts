import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(p0: any, p1: any): boolean {
    if (this.authService.isLoggedIn()) {
      return true;  // อนุญาตให้เข้าถึงหน้าได้ถ้าล็อกอินอยู่
    } else {
      this.router.navigate(['/login']);  // ถ้าไม่ได้ล็อกอินให้ redirect ไปหน้า login
      return false;
    }
  }
}
