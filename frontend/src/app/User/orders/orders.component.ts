import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../services/order.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  selectedOrder: any = null;

  constructor(private ordersService: OrdersService, private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  // ดึงข้อมูลคำสั่งซื้อเฉพาะของผู้ใช้ที่เข้าสู่ระบบ
  fetchOrders() {
    if (!this.authService.isLoggedIn()) {
      console.error('User not authorized to view orders.');
      alert('คุณต้องเข้าสู่ระบบเพื่อดูคำสั่งซื้อของคุณ.');
      return;
    }

    const userId = this.authService.getUserId(); // ดึง ID ของผู้ใช้จาก AuthService

    if (userId !== null && typeof userId === 'number') {
      this.ordersService.getOrdersByUserId(userId).subscribe(
        (data) => {
          this.orders = data; // กำหนดคำสั่งซื้อที่ดึงมาได้ให้กับอาร์เรย์ orders
        },
        (error: any) => { // เพิ่ม type ของ error เป็น any
          console.error('Error fetching orders:', error);
          alert('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้ กรุณาลองอีกครั้งในภายหลัง.');
        }
      );
    } else {
      console.error('User ID is null or invalid, cannot fetch orders.');
      alert('ID ของผู้ใช้ไม่ถูกต้อง กรุณาเข้าสู่ระบบอีกครั้ง.');
    }
  }

  // ดึงข้อมูลคำสั่งซื้อตาม ID
  viewOrderDetails(orderId: number) {
    this.ordersService.getOrderById(orderId).subscribe(
      (data) => {
        this.selectedOrder = data;
      },
      (error: any) => { // เพิ่ม type ของ error เป็น any
        console.error('Error fetching order details:', error);
      }
    );
  }

  // ยกเลิกคำสั่งซื้อ
  cancelOrder(orderId: number) {
    const order = this.orders.find(order => order.OrderId === orderId);
  
    // ตรวจสอบว่าคำสั่งซื้อนั้นสามารถยกเลิกได้หรือไม่
    if (order && order.OrderStatus === 'Pending') {
      if (confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?')) {
        this.ordersService.cancelOrder(orderId).subscribe(
          () => {
            alert('คำสั่งซื้อถูกยกเลิกเรียบร้อยแล้ว');
            this.fetchOrders(); // รีเฟรชรายการคำสั่งซื้อหลังจากยกเลิกเรียบร้อยแล้ว
          },
          (error: any) => { // เพิ่ม type ของ error เป็น any
            console.error('Error cancelling order:', error);
            alert('ไม่สามารถยกเลิกคำสั่งซื้อได้ กรุณาลองอีกครั้ง.');
          }
        );
      }
    } else {
      alert('ไม่สามารถยกเลิกคำสั่งซื้อที่ไม่อยู่ในสถานะ Pending ได้');
    }
  }

}
