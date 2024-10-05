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

  constructor(private ordersService: OrdersService,private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  // ดึงข้อมูลคำสั่งซื้อทั้งหมด
  fetchOrders() {
    if (!this.authService.isLoggedIn()) {
      console.error('User not authorized to view orders.');
      return;
    }
  
    this.ordersService.getOrders().subscribe(
      (data) => {
        this.orders = data;
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
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
