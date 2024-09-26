import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  salesData: any[] = [];
  filterType: string = '';
  filterValue: string = '';

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    this.getSalesData();
  }

  getSalesData(): void {
    this.salesService.getSalesData(this.filterType, this.filterValue).subscribe(
      (data) => {
        this.salesData = data;
      },
      (error) => {
        Swal.fire('Error', 'Unable to fetch sales data', 'error');
      }
    );
  }

  applyFilter(filterType: string, filterValue?: string): void {
    this.filterType = filterType;
    this.filterValue = filterValue || '';
    this.getSalesData();
  }
}
