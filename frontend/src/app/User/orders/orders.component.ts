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
        (error) => {
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
      (error) => {
        console.error('Error fetching order details:', error);
      }
    );
  }

  // ลบคำสั่งซื้อ
  deleteOrder(orderId: number) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.ordersService.deleteOrder(orderId).subscribe(
        () => {
          this.orders = this.orders.filter(order => order.OrderId !== orderId);
          alert('Order deleted successfully');
        },
        (error) => {
          console.error('Error deleting order:', error);
        }
      );
    }
  }
}
