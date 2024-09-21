import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;  // สร้างตัวแปร guard สำหรับเก็บ AuthGuard instance
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getRoleFromToken']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = new AuthGuard(TestBed.inject(AuthService), TestBed.inject(Router));  // สร้าง instance ใหม่ของ AuthGuard
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if the user has the correct role', () => {
    authService.getRoleFromToken.and.returnValue('admin');  // Mock ให้คืนค่า role เป็น admin

    const result = guard.canActivate({ data: { role: 'admin' } } as any, {} as any);
    expect(result).toBe(true);  // ตรวจสอบว่าอนุญาตให้เข้าถึงได้
  });

  it('should deny access and redirect to login if the user does not have the correct role', () => {
    authService.getRoleFromToken.and.returnValue('user');  // Mock ให้คืนค่า role เป็น user (ซึ่งไม่ตรงกับที่คาดหวัง)

    const result = guard.canActivate({ data: { role: 'admin' } } as any, {} as any);
    expect(result).toBe(false);  // ตรวจสอบว่าไม่อนุญาตให้เข้าถึง
    expect(router.navigate).toHaveBeenCalledWith(['/login']);  // ตรวจสอบว่ามีการนำทางไปที่หน้า login
  });

  it('should deny access and redirect to login if no role is found', () => {
    authService.getRoleFromToken.and.returnValue('');  // Mock ให้คืนค่าว่าง (ไม่มี role)

    const result = guard.canActivate({ data: { role: 'admin' } } as any, {} as any);
    expect(result).toBe(false);  // ตรวจสอบว่าไม่อนุญาตให้เข้าถึง
    expect(router.navigate).toHaveBeenCalledWith(['/login']);  // ตรวจสอบว่ามีการนำทางไปที่หน้า login
  });
});
