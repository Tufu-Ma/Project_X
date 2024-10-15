import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';  // นำเข้า SweetAlert2

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

  // ฟังก์ชันสำหรับตรวจสอบรหัสผ่าน
  validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;  // อย่างน้อย 8 ตัวอักษร และมีตัวพิมพ์ใหญ่ 1 ตัว
    return passwordRegex.test(password);
  }

  onResetPassword() {
    // ตรวจสอบเงื่อนไขของรหัสผ่านก่อน
    if (!this.validatePassword(this.newPassword)) {
      Swal.fire({
        title: 'Invalid Password',
        text: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    // ตรวจสอบว่าเลือกใช้การรีเซ็ตด้วย email หรือ phone
    if (this.resetMethod === 'email' && this.email && this.newPassword) {
      console.log('Sending reset request with email:', this.email);
      this.authService.resetPassword(this.email, '', this.newPassword).subscribe(
        response => {
          // แสดง SweetAlert2 เมื่อเปลี่ยนรหัสผ่านสำเร็จ
          Swal.fire({
            title: 'Password Reset Successful!',
            text: 'คุณได้เปลี่ยนรหัสผ่านสำเร็จแล้ว',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/login']);  // นำทางไปยังหน้า login
          });
        },
        error => {
          console.error('Error resetting password:', error);  // ตรวจสอบข้อผิดพลาด
          Swal.fire({
            title: 'Reset Failed',
            text: 'การรีเซ็ตรหัสผ่านล้มเหลว โปรดลองอีกครั้ง',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    } else if (this.resetMethod === 'phone' && this.phone && this.newPassword) {
      console.log('Sending reset request with phone:', this.phone);
      this.authService.resetPassword('', this.phone, this.newPassword).subscribe(
        response => {
          // แสดง SweetAlert2 เมื่อเปลี่ยนรหัสผ่านสำเร็จ
          Swal.fire({
            title: 'Password Reset Successful!',
            text: 'คุณได้เปลี่ยนรหัสผ่านสำเร็จแล้ว',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/login']);  // นำทางไปยังหน้า login
          });
        },
        error => {
          console.error('Error resetting password:', error);  // ตรวจสอบข้อผิดพลาด
          Swal.fire({
            title: 'Reset Failed',
            text: 'การรีเซ็ตรหัสผ่านล้มเหลว โปรดลองอีกครั้ง',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    } else {
      this.errorMessage = 'Please fill in all required fields.';
      Swal.fire({
        title: 'Incomplete Information',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }
}
