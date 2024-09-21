import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

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
          alert('Login successful');
          localStorage.setItem('token', response.token);  // เก็บ token ลงใน localStorage
          console.log(response.token,"Token กูนะ");
          
          console.log('User role:', response.role);  // ตรวจสอบบทบาทที่ได้จาก backend
  
          // ตรวจสอบว่า role ถูกส่งมาจาก backend และนำทางตาม role
          if (response.role === 'Admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        } else {
          this.errorMessage = 'Login failed. No token received.';
        }
      },
      (error) => {
        this.errorMessage = 'Invalid email or username and password';
        console.error(error);
      }
    );
  }
}  