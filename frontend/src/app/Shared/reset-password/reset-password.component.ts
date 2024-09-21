import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  email: string = '';
  phone: string = '';
  newPassword: string = '';
  resetMethod: string = '';  // เก็บค่าที่ผู้ใช้เลือกว่าจะใช้ email หรือ phone
  showPassword: boolean = false;  // ใช้สำหรับแสดง/ซ่อนรหัสผ่าน
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  // ฟังก์ชันสำหรับการแสดง/ซ่อนรหัสผ่าน
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onResetPassword() {
    if (this.resetMethod === 'email' && this.email && this.newPassword) {
      console.log('Sending reset request with email:', this.email);
      this.authService.resetPassword(this.email, '', this.newPassword).subscribe(
        response => {
          alert('Password reset successful');
          this.router.navigate(['/login']);
        },
        error => {
          console.error('Error resetting password:', error);  // ตรวจสอบข้อผิดพลาด
          this.errorMessage = 'Failed to reset password. Please try again.';
        }
      );
    } else if (this.resetMethod === 'phone' && this.phone && this.newPassword) {
      console.log('Sending reset request with phone:', this.phone);
      this.authService.resetPassword('', this.phone, this.newPassword).subscribe(
        response => {
          alert('Password reset successful');
          this.router.navigate(['/login']);
        },
        error => {
          console.error('Error resetting password:', error);  // ตรวจสอบข้อผิดพลาด
          this.errorMessage = 'Failed to reset password. Please try again.';
        }
      );
    } else {
      this.errorMessage = 'Please fill in all required fields.';
    }
}
}