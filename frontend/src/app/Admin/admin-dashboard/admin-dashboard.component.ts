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
        if (data && Array.isArray(data)) {
          this.salesData = data;
        } else {
          Swal.fire('Error', 'Invalid sales data format', 'error');
        }
      },
      (error) => {
        console.error('Error fetching sales data:', error);
        Swal.fire('Error', 'Unable to fetch sales data', 'error');
      }
    );
  }

  applyFilter(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const filterType = selectElement.value;
  
    if (!filterType) {
      Swal.fire('Warning', 'Please select a filter type', 'warning');
      return;
    }
  
    this.filterType = filterType;
    this.getSalesData();
  }  
}
