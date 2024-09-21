import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';

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

  constructor(private authService: AuthService) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // เพิ่มการตรวจสอบอีเมลหรือฟิลด์ที่จำเป็น
  validateForm(): boolean {
    if (!this.email || !this.username || !this.phone || !this.password || !this.confirmPassword || !this.firstName || !this.lastName) {
      this.errorMessage = 'All fields are required.';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
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
    // ตรวจสอบฟอร์ม
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

    console.log('Register Data:', registerData);

    this.authService.register(this.email, this.password, this.username, this.phone, this.firstName, this.lastName, this.gender).subscribe(
      response => {
        console.log('Register success:', response);
        this.errorMessage = '';  // รีเซ็ตข้อความ error หลังจากสำเร็จ
      },
      error => {
        this.errorMessage = 'Registration failed. Please try again.';
        console.error('Register error:', error);
      }
    );
  }
}
