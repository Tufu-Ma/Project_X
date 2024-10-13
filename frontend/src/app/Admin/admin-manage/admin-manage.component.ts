import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { OrdersService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-manage',
  templateUrl: './admin-manage.component.html',
  styleUrls: ['./admin-manage.component.css']
})
export class AdminManageComponent implements OnInit {
  orders: any[] = []; // เก็บข้อมูลคำสั่งซื้อทั้งหมด
  activeOrders: any[] = []; // คำสั่งซื้อที่ยังไม่ถูกยกเลิก
  cancelledOrders: any[] = []; // คำสั่งซื้อที่ถูกยกเลิก

  constructor(private ordersService: OrdersService, private productService: ProductService) {}

  ngOnInit(): void {
    this.getOrders();  // ดึงข้อมูลคำสั่งซื้อเมื่อหน้าโหลด
  }

  // ฟังก์ชันสำหรับดึงข้อมูลคำสั่งซื้อทั้งหมด
  getOrders(): void {
    this.ordersService.getOrders().subscribe(
      (data: any[]) => {
        this.orders = data;

        // แยกคำสั่งซื้อที่ยังไม่ถูกยกเลิกและคำสั่งซื้อที่ถูกยกเลิก
        this.activeOrders = this.orders.filter(order => order.OrderStatus !== 'Cancelled');
        this.cancelledOrders = this.orders.filter(order => order.OrderStatus === 'Cancelled');

        // ดึงข้อมูลภาพของสินค้าจาก ProductService สำหรับคำสั่งซื้อที่ยังไม่ถูกยกเลิก
        const activeProductIds = this.activeOrders.map(order => order.ProductId);
        const cancelledProductIds = this.cancelledOrders.map(order => order.ProductId);

        // ตรวจสอบว่ามี productIds สำหรับ activeOrders หรือไม่
        if (activeProductIds.length > 0) {
          this.productService.getProductsByIds(activeProductIds).subscribe(
            (products) => {
              // จัดการกับข้อมูลสินค้าที่ได้รับ
              this.activeOrders = this.activeOrders.map(order => {
                const product = products.find(p => p.ProductId === order.ProductId);
                return {
                  ...order,
                  ProductImage: product ? product.ImageUrl : 'assets/default.jpg', // เพิ่มภาพที่ดึงมา
                };
              });
            },
            (error) => {
              console.error('Error fetching active products:', error);
            }
          );
        }

        // ตรวจสอบว่ามี productIds สำหรับ cancelledOrders หรือไม่
        if (cancelledProductIds.length > 0) {
          this.productService.getProductsByIds(cancelledProductIds).subscribe(
            (products) => {
              // จัดการกับข้อมูลสินค้าที่ได้รับ
              this.cancelledOrders = this.cancelledOrders.map(order => {
                const product = products.find(p => p.ProductId === order.ProductId);
                return {
                  ...order,
                  ProductImage: product ? product.ImageUrl : 'assets/default.jpg', // เพิ่มภาพที่ดึงมา
                };
              });
            },
            (error) => {
              console.error('Error fetching cancelled products:', error);
            }
          );
        }
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }

  // ฟังก์ชันสำหรับอัปเดตสถานะคำสั่งซื้อ
  updateOrderStatus(orderId: number, newStatus: string): void {
    if (!newStatus || !orderId) {
      Swal.fire('Error', 'Invalid Order ID or Status', 'error');
      return;
    }

    this.ordersService.updateOrderStatus(orderId, newStatus).subscribe(
      (response) => {
        Swal.fire('Success', 'Order status updated successfully!', 'success');
        this.getOrders();  // ดึงข้อมูลคำสั่งซื้อใหม่หลังจากอัปเดต
      },
      (error) => {
        Swal.fire('Error', 'Error updating order status', 'error');
        console.error('Error updating order status:', error);
      }
    );
  }

  // ฟังก์ชันสำหรับดึง URL ของภาพผลิตภัณฑ์
  getImageUrl(imageUrl: string): string {
    return imageUrl ? `http://localhost:3000${imageUrl}` : 'assets/default.jpg'; // คืนค่าที่อยู่ภาพ
  }
}
