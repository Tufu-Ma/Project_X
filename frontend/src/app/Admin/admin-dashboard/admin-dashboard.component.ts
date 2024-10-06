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
  chartType: ChartType = 'bar';  // กำหนดชนิดของกราฟเป็น ChartType

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.salesService.getBestSellingProducts().subscribe((data: any) => {
      this.bestSellingProducts = data;
      this.bestSellingChartData = this.mapChartData(data);
    });

    this.salesService.getWorstSellingProducts().subscribe((data: any) => {
      this.worstSellingProducts = data;
      this.worstSellingChartData = this.mapChartData(data);
    });
  }

  private mapChartData(data: any): any {
    return {
      labels: data.map((item: any) => item.ProductId),  // ปรับตามข้อมูลจากตาราง OrderItems
      datasets: [
        {
          data: data.map((item: any) => item.TotalQuantity),  // ใช้ TotalQuantity เป็นข้อมูลกราฟ
          label: 'Total Sales',
          backgroundColor: 'rgba(75, 192, 192, 0.6)'
        }
      ]
    };
  }
}
