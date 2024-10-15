import { Component, OnInit } from '@angular/core';
import { ChartType } from 'chart.js';
import { SalesService } from '../../services/sales.service';

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
  startDate: string = '';
  endDate: string = '';
  totalSales = 0;
  bestSellingProducts: Product[] = [];
  worstSellingProducts: Product[] = [];
  totalSalesData: any[] = [];

  bestSellingChartData: any;
  worstSellingChartData: any;
  totalSalesChartData: any;

  chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const dataset = tooltipItem.dataset;
            const dataIndex = tooltipItem.dataIndex;
            const label = dataset.label || '';
            const value = dataset.data[dataIndex];
            return `${label}: ${value}`;
          }
        }
      },
      legend: {
        display: false, // ซ่อน legend เพื่อไม่แสดงชื่อที่ยาวเกินไป
      }
    },
    scales: {
      x: {
        ticks: {
          display: false // ซ่อนชื่อบนแกน X
        },
        grid: {
          display: false // ซ่อนเส้นตารางของแกน X หากไม่ต้องการ
        }
      },
      y: {
        beginAtZero: true // เริ่มกราฟจาก 0
      }
    }
  };
  
  chartLegend = false; // ซ่อน legend
  totalSalesChartType: ChartType = 'line';
  bestSellingChartType: ChartType = 'bar';
  worstSellingChartType: ChartType = 'bar';

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    const today = new Date();
    this.startDate = today.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    if (!this.startDate || !this.endDate) {
      console.error('Start date and end date are required.');
      return;
    }

    this.salesService.getTotalSales(this.startDate, this.endDate).subscribe(
      (data: any) => {
        this.totalSales = data.totalSales;
        this.totalSalesData = data.sales;
        this.totalSalesChartData = this.mapChartData(data.sales, 'total');
        console.log('Total Sales Chart Data:', this.totalSalesChartData); // ตรวจสอบข้อมูลกราฟ
      },
      (error) => {
        console.error('Error fetching sales data:', error);
      }
    );

    this.salesService.getBestSellingProducts(this.startDate, this.endDate).subscribe(
      (data: Product[]) => {
        this.bestSellingProducts = data.sort((a: Product, b: Product) => b.TotalQuantity - a.TotalQuantity);
        this.bestSellingChartData = this.mapChartData(this.bestSellingProducts, 'TotalQuantity');
      },
      (error) => {
        console.error('Error fetching best selling products:', error);
      }
    );

    this.salesService.getWorstSellingProducts(this.startDate, this.endDate).subscribe(
      (data: Product[]) => {
        this.worstSellingProducts = data.sort((a: Product, b: Product) => a.TotalQuantity - b.TotalQuantity);
        this.worstSellingChartData = this.mapChartData(this.worstSellingProducts, 'TotalQuantity');
      },
      (error) => {
        console.error('Error fetching worst selling products:', error);
      }
    );
  }

  private mapChartData(data: any, valueField: string): any {
    return {
      labels: data.map((item: any) => item.date || item.ProductName), // แสดงวันที่หรือชื่อสินค้า
      datasets: [
        {
          data: data.map((item: any) => item[valueField]),
          label: valueField === 'TotalQuantity' ? 'Total Quantity Sold' : 'Total Sales',
          backgroundColor: valueField === 'TotalQuantity' ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
        }
      ]
    };
  }

  downloadReport(): void {
    if (!this.startDate || !this.endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    this.salesService.downloadSalesReport(this.startDate, this.endDate).subscribe(
      (response) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'SalesReport.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error) => {
        console.error('Error downloading report:', error);
      }
    );
  }
}
