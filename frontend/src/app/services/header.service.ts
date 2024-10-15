import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  // ใน HeaderService
private isAdminSubject = new BehaviorSubject<boolean>(false);
isAdmin$ = this.isAdminSubject.asObservable();

setAdminStatus(isAdmin: boolean) {
  this.isAdminSubject.next(isAdmin);
}
}
