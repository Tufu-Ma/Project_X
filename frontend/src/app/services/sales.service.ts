import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = 'http://localhost:3000/api/sales';

  constructor(private http: HttpClient) {}

  getSalesData(filterType: string, filterValue: string): Observable<any> {
    let params = new HttpParams().set('filterType', filterType).set('filterValue', filterValue);
    return this.http.get<any>(this.apiUrl, { params });
  }
}
