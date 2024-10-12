import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { OrdersService } from '../../services/order.service';

@Component({
  selector: 'app-admin-manage',
  templateUrl: './admin-manage.component.html',
  styleUrls: ['./admin-manage.component.css']
})
export class AdminManageComponent implements OnInit {
  orders: any[] = []; // เก็บข้อมูลคำสั่งซื้อ

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.getOrders();  // ดึงข้อมูลคำสั่งซื้อเมื่อหน้าโหลด
  }

  // ฟังก์ชันสำหรับดึงข้อมูลคำสั่งซื้อทั้งหมด
  getOrders(): void {
    this.ordersService.getOrders().subscribe(
      (data: any[]) => {
        // แปลงข้อมูลให้สามารถแสดงได้ง่าย
        this.orders = data.map(order => ({
          ...order,
          quantity: order.Quantity,
          customerName: `${order.Name}`, // สมมติว่าชื่อผู้ใช้จะดึงจาก UserId
          newStatus: order.OrderStatus // กำหนดค่าเริ่มต้นให้ dropdown
        }));
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
}
