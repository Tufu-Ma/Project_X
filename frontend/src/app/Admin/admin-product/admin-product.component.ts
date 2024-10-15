import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/categories.service';


@Component({
  selector: 'app-admin-product',
  templateUrl: './admin-product.component.html',
  styleUrls: ['./admin-product.component.css']
})
export class AdminProductComponent implements OnInit {
  products: any[] = [];
  categories: any[] = []; // เพิ่มตัวแปรสำหรับเก็บหมวดหมู่
  productForm: FormGroup;
  selectedFile: File | null = null;
  isEditMode = false;
  isAddingNewCategory = false; // เพิ่มตัวแปรสำหรับเช็คว่ากำลังเพิ่มหมวดหมู่ใหม่หรือไม่
  selectedProductId: number | null = null;
  newCategoryName: string = ''; // เก็บชื่อหมวดหมู่ใหม่ที่ต้องการเพิ่ม

  constructor(
    private productService: ProductService, 
    private categoryService: CategoryService, // ใช้ชื่อที่สอดคล้องกัน
    private fb: FormBuilder
  ) {
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
    this.loadCategories(); // ต้องมีการเรียกฟังก์ชันนี้
  }  

  // ฟังก์ชันสำหรับโหลดหมวดหมู่
loadCategories(): void {
  this.categoryService.getCategories().subscribe(
    (response: any[]) => {
      // กรองหมวดหมู่ที่มีสถานะ 'Active'
      this.categories = response.filter(category => category.Status === 'Active');
    },
    (error) => {
      console.error('Error fetching categories:', error);
    }
  );
}  


  loadProducts(): void {
    this.productService.getProducts().subscribe(
      (response: any[]) => {
        this.products = response;
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }
  
  // ฟังก์ชันตรวจสอบเมื่อเปลี่ยนหมวดหมู่ใน dropdown
  onCategoryChange(event: any): void {
    const selectedValue = event.target.value;
    if (selectedValue == -1) {
      this.isAddingNewCategory = true; // ถ้าผู้ใช้เลือกเพิ่มหมวดหมู่ใหม่
    } else {
      this.isAddingNewCategory = false; // ถ้าเป็นการเลือกหมวดหมู่ที่มีอยู่แล้ว
    }
  }

  // เพิ่มการส่งค่า Status เมื่อเพิ่มหมวดหมู่ใหม่
addCategory(): void {
  if (this.newCategoryName.trim() !== '') {
    this.categoryService.addCategory({ CategoryName: this.newCategoryName, Status: 'Active' }).subscribe(
      response => {
        console.log('Category added successfully:', response);
        this.loadCategories(); // โหลดหมวดหมู่ใหม่หลังจากเพิ่มสำเร็จ
        this.isAddingNewCategory = false; // กลับไปยังโหมดปกติ
        this.newCategoryName = ''; // รีเซ็ตชื่อหมวดหมู่ใหม่
      },
      error => {
        console.error('Error adding category:', error);
      }
    );
  }
}


  onSubmit(): void {
    if (this.productForm.invalid) {
      console.error('Form is invalid');
      return; // ถ้าฟอร์มไม่ถูกต้อง หยุดทำงาน
    }

    const formData = new FormData();
    formData.append('productName', this.productForm.get('productName')?.value);
    formData.append('categoryId', this.productForm.get('categoryId')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('price', this.productForm.get('price')?.value);
    formData.append('stock', this.productForm.get('stock')?.value);
    formData.append('brand', this.productForm.get('brand')?.value);
    formData.append('model', this.productForm.get('model')?.value);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    if (this.isEditMode && this.selectedProductId) {
      this.productService.updateProduct(this.selectedProductId, formData).subscribe(
        () => {
          console.log('Product updated successfully');
          this.loadProducts();
          this.resetForm();
        },
        error => {
          console.error('Error updating product:', error);
        }
      );
    } else {
      this.productService.addProduct(formData).subscribe(
        () => {
          console.log('Product added successfully');
          this.loadProducts();
          this.resetForm();
        },
        error => {
          console.error('Error adding product:', error);
        }
      );
    }
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedProductId = null;
    this.productForm.reset();
    this.selectedFile = null;
    this.isAddingNewCategory = false;
  }

  onEdit(product: any): void {
    this.isEditMode = true;
    this.selectedProductId = product.ProductId;

    this.productForm.patchValue({
      productName: product.ProductName,
      categoryId: product.CategoryId,
      description: product.Description,
      price: product.Price,
      stock: product.Stock,
      brand: product.Brand,
      model: product.Model
    });

    this.selectedFile = null;
  }

  onDelete(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe(
        () => {
          console.log('Product deleted successfully');
          this.loadProducts();
        },
        error => {
          console.error('Error deleting product:', error);
        }
      );
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }

  getImageUrl(imageUrl: string): string {
    return imageUrl ? `http://localhost:3000${imageUrl}` : 'assets/default.jpg';
  }
}
