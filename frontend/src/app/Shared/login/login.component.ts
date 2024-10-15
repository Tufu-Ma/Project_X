import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';  // นำเข้า SweetAlert2

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  emailOrUsername: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    this.authService.login(this.emailOrUsername, this.password).subscribe(
      (response: any) => {
        if (response && response.token) {
          // ใช้ SweetAlert2 แทน alert() เดิม
          Swal.fire({
            title: 'Login Successful!',
            text: 'คุณเข้าสู่ระบบสำเร็จแล้ว',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            localStorage.setItem('token', response.token);  // เก็บ token ลงใน localStorage
            console.log(response.token, "Token กูนะ");
            
            console.log('User role:', response.role);  // ตรวจสอบบทบาทที่ได้จาก backend
        
            // ตรวจสอบว่า role ถูกส่งมาจาก backend และนำทางตาม role
            if (response.role === 'Admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/home']);
            }
          });
        } else {
          this.errorMessage = 'Login failed. No token received.';
          // แสดงข้อความแจ้งเตือนเมื่อเข้าสู่ระบบล้มเหลว
          Swal.fire({
            title: 'Login Failed!',
            text: 'การเข้าสู่ระบบล้มเหลว: ไม่ได้รับ Token',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      },
      (error) => {
        this.errorMessage = 'Invalid email or username and password';
        // แสดงข้อความแจ้งเตือนเมื่อเกิดข้อผิดพลาดในการเข้าสู่ระบบ
        Swal.fire({
          title: 'Login Failed!',
          text: 'อีเมล/ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        console.error(error);
      }
    );
  }
}
