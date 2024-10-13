import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';

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
import { AdminManageComponent } from './Admin/admin-manage/admin-manage.component';
import { AdminProductComponent } from './Admin/admin-product/admin-product.component';

// User Components
import { ProductListComponent } from './User/product-list/product-list.component';

// Services
import { AuthService } from './auth.service';
import { ProductService } from './services/product.service';
import { CartService } from './services/cart.service';
import { CartComponent } from './User/cart/cart.component';
import { OrdersComponent } from './User/orders/orders.component';
import { CategoryService } from './services/categories.service';

// กำหนดเส้นทางของแอปพลิเคชัน
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'admin-manage', component: AdminManageComponent},
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
    AdminManageComponent,
    AdminProductComponent,

    // User Components
    
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
    NgChartsModule,
  ],
  providers: [AuthService, ProductService, CartService, CategoryService],
  bootstrap: [AppComponent]
})
export class AppModule { }
