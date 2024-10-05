import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Shared Components
import { LoginComponent } from './Shared/login/login.component';
import { RegisterComponent } from './Shared/register/register.component';
import { HomeComponent } from './Shared/home/home.component';
import { ResetPasswordComponent } from './Shared/reset-password/reset-password.component';
import { ProductDetailComponent } from './Shared/product-detail/product-detail.component';
import { HeaderComponent } from './Shared/header/header.component';
import { FooterComponent } from './Shared/footer/footer.component';
import { LoginHeaderComponent } from './Shared/login/login-header/login-header.component';
import { AboutUsComponent } from './Shared/about-us/about-us.component';
import { ContactUsComponent } from './Shared/contact-us/contact-us.component';



// Admin Components
import { AdminDashboardComponent } from './Admin/admin-dashboard/admin-dashboard.component';
import { AdminOrdersComponent } from './Admin/admin-orders/admin-orders.component';
import { AdminProductComponent } from './Admin/admin-product/admin-product.component';

// User Components
import { ProfileComponent } from './User/profile/profile.component';
import { OrderHistoryComponent } from './User/order-history/order-history.component';
import { ProductListComponent } from './User/product-list/product-list.component';

// Services
import { AuthService } from './auth.service';
import { ProductService } from './services/product.service';
import { CartService } from './services/cart.service';
import { CartComponent } from './User/cart/cart.component';
import { OrdersComponent } from './User/orders/orders.component';


// กำหนดเส้นทางของแอปพลิเคชัน
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent },  // เพิ่มเส้นทางไปยังหน้าโปรไฟล์
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'admin-orders', component: AdminOrdersComponent },
  { path: 'admin-products', component: AdminProductComponent },
 
];

@NgModule({
  declarations: [
    AppComponent,
    // Shared Components
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ResetPasswordComponent,
    ProductDetailComponent,
    HeaderComponent,
    FooterComponent,
    LoginHeaderComponent,
    AboutUsComponent,
    ContactUsComponent,


    // Admin Components
    AdminDashboardComponent,
    AdminOrdersComponent,
    AdminProductComponent,

    // User Components
    ProfileComponent,
    OrderHistoryComponent,
    ProductListComponent,
    CartComponent,
    OrdersComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [AuthService, ProductService, CartService],
  bootstrap: [AppComponent]
})
export class AppModule { }
