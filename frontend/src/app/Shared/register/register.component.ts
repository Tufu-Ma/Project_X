import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router'; // เพิ่มการนำเข้า Router
import Swal from 'sweetalert2'; // เพิ่มการนำเข้า SweetAlert2

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  email: string = '';
  username: string = '';
  phone: string = '';
  password: string = '';
  confirmPassword: string = '';
  firstName: string = '';
  lastName: string = '';
  gender: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {} // เพิ่ม Router ใน constructor

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validateForm(): boolean {
    if (!this.email || !this.username || !this.phone || !this.password || !this.confirmPassword || !this.firstName || !this.lastName) {
      this.errorMessage = 'All fields are required.';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return false;
    }

    // ตรวจสอบว่ารหัสผ่านมีอย่างน้อย 8 ตัวอักษรและมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.errorMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter.';

      // แสดงข้อความแจ้งเตือนด้วย SweetAlert2
      Swal.fire({
        title: 'Invalid Password!',
        text: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัว และต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว',
        icon: 'warning',
        confirmButtonText: 'OK'
      });

      return false;
    }

    // ตรวจสอบรูปแบบอีเมล (email format)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Invalid email format.';
      return false;
    }

    return true;
  }

  onRegister() {
    if (!this.validateForm()) {
      return;
    }

    const registerData = {
      email: this.email,
      username: this.username,
      password: this.password,
      phone: this.phone,
      firstName: this.firstName,
      lastName: this.lastName,
      gender: this.gender
    };

    this.authService.register(this.email, this.password, this.username, this.phone, this.firstName, this.lastName, this.gender).subscribe(
      response => {
        console.log('Register success:', response);
        this.errorMessage = '';  // รีเซ็ตข้อความ error หลังจากสำเร็จ

        // แสดง SweetAlert2 เมื่อสมัครเสร็จ
        Swal.fire({
          title: 'Registration Successful!',
          text: 'คุณลงทะเบียนสำเร็จแล้ว คุณจะถูกนำไปที่หน้าเข้าสู่ระบบ',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/login']);  // นำทางไปยังหน้า login
        });

      },
      error => {
        this.errorMessage = 'Registration failed. Please try again.';

        // แสดง SweetAlert2 เมื่อเกิดข้อผิดพลาด
        Swal.fire({
          title: 'Error!',
          text: 'การลงทะเบียนล้มเหลว โปรดลองอีกครั้ง',
          icon: 'error',
          confirmButtonText: 'OK'
        });

        console.error('Register error:', error);
      }
    );
  }
}
