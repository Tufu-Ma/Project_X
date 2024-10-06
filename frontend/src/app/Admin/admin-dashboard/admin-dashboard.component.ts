import { Component, OnInit } from '@angular/core';
import { ChartType } from 'chart.js';  // นำเข้า ChartType จาก chart.js
import { SalesService } from '../../services/sales.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  totalSales = 0;
  bestSellingProducts: any[] = [];
  worstSellingProducts: any[] = [];

  bestSellingChartData: any;
  worstSellingChartData: any;

  chartOptions = {
    responsive: true
  };
  chartLegend = true;
  chartType: ChartType = 'bar';  // ใช้ชนิด ChartType จาก chart.js โดยกำหนดเป็น 'bar'

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    // ดึงข้อมูลสินค้าขายดีที่สุด
    this.salesService.getBestSellingProducts().subscribe((data: any) => {
      this.bestSellingProducts = data;
      this.bestSellingChartData = this.mapChartData(data);
    });

    // ดึงข้อมูลสินค้าขายได้น้อยที่สุด
    this.salesService.getWorstSellingProducts().subscribe((data: any) => {
      this.worstSellingProducts = data;
      this.worstSellingChartData = this.mapChartData(data);
    });
  }

  // แปลงข้อมูลเพื่อใช้กับกราฟ
  private mapChartData(data: any): any {
    if (data && data.length > 0) {
      return {
        labels: data.map((item: any) => item.ProductName),  // ใช้ ProductName เป็น label
        datasets: [
          {
            data: data.map((item: any) => item.TotalQuantity),  // ใช้ TotalQuantity เป็นข้อมูลกราฟ
            label: 'Total Quantity Sold',
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
          }
        ]
      };
    } else {
      return null;  // ถ้าไม่มีข้อมูลให้ส่ง null กลับ
    }
  }
}
