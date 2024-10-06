import { Component, OnInit } from '@angular/core';
import { ChartType } from 'chart.js';  // นำเข้า ChartType จาก chart.js
import { SalesService } from '../../services/sales.service';

// สร้างอินเทอร์เฟซสำหรับข้อมูลผลิตภัณฑ์
interface Product {
  ProductName: string;
  TotalQuantity: number;
  TotalSales: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  totalSales = 0;
  bestSellingProducts: Product[] = [];
  worstSellingProducts: Product[] = [];
  totalSalesData: any[] = [];  // สำหรับตารางยอดขายรวม

  bestSellingChartData: any;
  worstSellingChartData: any;
  totalSalesChartData: any;  // สำหรับกราฟยอดขายรวม

  chartOptions = {
    responsive: true
  };
  chartLegend = true;
  
  // กำหนดชนิดของกราฟ
  totalSalesChartType: ChartType = 'line';  // กราฟยอดขายรวมเป็นเส้น
  bestSellingChartType: ChartType = 'bar';   // กราฟสินค้าขายดีเป็นแท่ง
  worstSellingChartType: ChartType = 'bar';   // กราฟสินค้าขายไม่ดีเป็นแท่ง

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    // ดึงข้อมูลยอดขายรวม
    this.salesService.getTotalSales().subscribe((data: any) => {
      this.totalSales = data.totalSales;  // แสดงผลรวมยอดขายทั้งหมด
      this.totalSalesData = data.sales;    // ข้อมูลตารางยอดขาย
      this.totalSalesChartData = this.mapChartData(data.sales, 'total');  // สร้างข้อมูลสำหรับกราฟยอดขายรวม
    });
  
    // ดึงข้อมูลสินค้าที่ขายดีที่สุด
    this.salesService.getBestSellingProducts().subscribe((data: Product[]) => {
      this.bestSellingProducts = data.sort((a: Product, b: Product) => b.TotalSales - a.TotalSales); // เรียงตามยอดขาย
      this.bestSellingChartData = this.mapChartData(this.bestSellingProducts, 'TotalSales');  // สร้างข้อมูลสำหรับกราฟสินค้าขายดี
    });
  
    // ดึงข้อมูลสินค้าที่ขายไม่ดี
    this.salesService.getWorstSellingProducts().subscribe((data: Product[]) => {
      this.worstSellingProducts = data.sort((a: Product, b: Product) => a.TotalSales - b.TotalSales); // เรียงตามยอดขาย
      this.worstSellingChartData = this.mapChartData(this.worstSellingProducts, 'TotalSales');  // สร้างข้อมูลสำหรับกราฟสินค้าขายไม่ดี
    });
  }
  
  private mapChartData(data: any, valueField: string): any {
    console.log("Data for chart:", data); // ตรวจสอบข้อมูลที่ส่งไป
    return {
      labels: data.map((item: any) => item.ProductName || item.date),
      datasets: [
        {
          data: data.map((item: any) => item[valueField]),
          label: valueField === 'TotalSales' ? 'Total Sales' : 'Sales Quantity',
          backgroundColor: valueField === 'TotalSales' ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
        }
      ]
    };
  }
}
