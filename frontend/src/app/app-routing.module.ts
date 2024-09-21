import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Shared Components
import { LoginComponent } from './Shared/login/login.component';
import { HomeComponent } from './Shared/home/home.component';
import { RegisterComponent } from './Shared/register/register.component';  
import { ResetPasswordComponent } from './Shared/reset-password/reset-password.component'; 
import { ProductDetailComponent } from './Shared/product-detail/product-detail.component';
import { HeaderComponent } from './Shared/header/header.component';
import { LoginHeaderComponent } from './Shared/login/login-header/login-header.component';
import { ShoppingCartComponent } from './User/shopping-cart/shopping-cart.component';
import { ProductListComponent } from './User/product-list/product-list.component';
import { AboutUsComponent } from './Shared/about-us/about-us.component';
import { ContactUsComponent } from './Shared/contact-us/contact-us.component';

// Admin Components
import { AdminDashboardComponent } from './Admin/admin-dashboard/admin-dashboard.component';  
import { AdminProductComponent } from './Admin/admin-product/admin-product.component';

// Guards
import { AuthGuard } from './auth.guard';  // นำเข้า Guard สำหรับตรวจสอบสิทธิ์เข้าใช้งาน

const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'home', component: HomeComponent },
  { path: 'header',component: HeaderComponent},
  { path: 'login-header',component:LoginHeaderComponent},
  { path: 'cart',component:ShoppingCartComponent},
  { path: 'about-us',component:AboutUsComponent},
  { path: 'contact-us',component:ContactUsComponent},
  
  // Product routes
  { path: 'product-detail/:id', component: ProductDetailComponent },
  { path: 'product-list',component:ProductListComponent},

  // Admin routes (protected by AuthGuard)
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin-product', component: AdminProductComponent, canActivate: [AuthGuard] },

  // Redirects
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }  // Redirect unknown paths to login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
