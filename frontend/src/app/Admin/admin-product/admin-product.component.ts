import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-product',
  templateUrl: './admin-product.component.html',
  styleUrls: ['./admin-product.component.css']
})
export class AdminProductComponent implements OnInit {
  products: any[] = [];
  productForm: FormGroup;
  selectedFile: File | null = null;
  isEditMode = false;
  selectedProductId: number | null = null;

  constructor(private productService: ProductService, private fb: FormBuilder) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      categoryId: ['', Validators.required],
      description: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      brand: [''],
      model: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(
      response => {
        this.products = response;
      },
      error => {
        console.error('Error fetching products:', error);
      }
    );
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    
    if (file) {
      this.selectedFile = file; // เก็บไฟล์ที่ถูกเลือก
      console.log('Selected file:', file.name); // ตรวจสอบชื่อไฟล์ใน console
    } else {
      console.error('No file selected');
    }
  }
  
  onSubmit(): void {
    const formData = new FormData();
    
    // ตรวจสอบค่าก่อนส่ง
    console.log('Form Data:', this.productForm.value);
  
    formData.append('productName', this.productForm.get('productName')?.value);
    formData.append('categoryId', this.productForm.get('categoryId')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('price', this.productForm.get('price')?.value);
    formData.append('stock', this.productForm.get('stock')?.value);
    formData.append('brand', this.productForm.get('brand')?.value);
    formData.append('model', this.productForm.get('model')?.value);
  
    // ถ้ามีไฟล์ถูกเลือก
    if (this.selectedFile) {
      console.log('Uploading file:', this.selectedFile.name); // ตรวจสอบชื่อไฟล์อีกครั้ง
      formData.append('image', this.selectedFile, this.selectedFile.name); // เก็บชื่อไฟล์พร้อมนามสกุล
    }    
  
    // ตรวจสอบว่ากำลังอยู่ในโหมดแก้ไขหรือไม่
    if (this.isEditMode && this.selectedProductId) {
      console.log('Editing product with ID:', this.selectedProductId);
      // ถ้าอยู่ในโหมดแก้ไขให้เรียกฟังก์ชัน updateProduct
      this.productService.updateProduct(this.selectedProductId, formData).subscribe(
        () => {
          console.log('Product updated successfully');
          this.loadProducts();  // โหลดสินค้าหลังจากอัปเดต
          this.resetForm();  // รีเซ็ตฟอร์มหลังจากอัปเดต
        },
        error => {
          console.error('Error updating product:', error);
        }
      );
    } else {
      console.log('Adding new product');
      // ถ้าไม่อยู่ในโหมดแก้ไขให้เรียกฟังก์ชัน addProduct
      this.productService.addProduct(formData).subscribe(
        () => {
          console.log('Product added successfully');
          this.loadProducts();  // โหลดสินค้าหลังจากเพิ่มเสร็จ
          this.resetForm();  // รีเซ็ตฟอร์ม
        },
        error => {
          console.error('Error adding product:', error);
        }
      );
    }
  }
  
  // ฟังก์ชันสำหรับรีเซ็ตฟอร์มหลังการเพิ่มหรือแก้ไขสินค้า
  resetForm(): void {
    this.isEditMode = false;  // ออกจากโหมดแก้ไขหลังจากรีเซ็ตฟอร์ม
    this.selectedProductId = null;
    this.productForm.reset();
    this.selectedFile = null;
  }
  
  // ฟังก์ชันสำหรับแก้ไขสินค้า
  onEdit(product: any): void {
    this.isEditMode = true;  // เข้าสู่โหมดแก้ไข
    this.selectedProductId = product.ProductId;  // เก็บรหัสสินค้าที่กำลังแก้ไข
  
    // ตั้งค่าให้กับฟอร์มสำหรับแก้ไข
    this.productForm.patchValue({
      productName: product.ProductName,
      categoryId: product.CategoryId,
      description: product.Description,
      price: product.Price,
      stock: product.Stock,
      brand: product.Brand,
      model: product.Model
    });
  
    this.selectedFile = null;  // รีเซ็ตไฟล์เพื่อให้ผู้ใช้สามารถอัปโหลดไฟล์ใหม่
  }
  

  // ฟังก์ชันสำหรับลบสินค้า
  onDelete(productId: number): void {
    if (!productId) {
      console.error("Product ID is undefined or null");
      return;
    }
    this.productService.deleteProduct(productId).subscribe(
      () => {
        console.log('Product deleted successfully');
        this.loadProducts();  // โหลดสินค้าหลังจากลบ
      },
      error => {
        console.error('Error deleting product:', error);
      }
    );
  }
}
