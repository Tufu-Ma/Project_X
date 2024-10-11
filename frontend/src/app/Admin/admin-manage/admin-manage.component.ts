import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { OrdersService } from '../../services/order.service';

@Component({
  selector: 'app-admin-manage',
  templateUrl: './admin-manage.component.html',
  styleUrls: ['./admin-manage.component.css']
})
export class AdminManageComponent implements OnInit {
  orders: any[] = [];  // เก็บข้อมูลคำสั่งซื้อ

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.getOrders();  // ดึงข้อมูลคำสั่งซื้อเมื่อหน้าโหลด
  }

  // ฟังก์ชันสำหรับดึงข้อมูลคำสั่งซื้อ
  getOrders(): void {
    this.ordersService.getOrders().subscribe(
      (data: any[]) => {
        this.orders = data;
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }

  // ฟังก์ชันสำหรับอัปเดตสถานะคำสั่งซื้อ
updateOrderStatus(orderId: number, OrderStatus: string): void {
  this.ordersService.updateOrderStatus(orderId, OrderStatus).subscribe(
    (response) => {
      Swal.fire('Success', 'Order status updated successfully!', 'success');
      this.getOrders();  // ดึงข้อมูลคำสั่งซื้อใหม่หลังจากอัปเดตสถานะ
    },
    (error) => {
      Swal.fire('Error', 'Error updating order status', 'error');
      console.error('Error updating order status:', error);
    }
  );
}

}
