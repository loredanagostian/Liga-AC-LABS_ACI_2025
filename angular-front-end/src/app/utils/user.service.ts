import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginResponse } from '../interfaces/login-response.interface';

@Injectable({ providedIn: 'root' })
export class UserService {

    constructor(
        private http: HttpClient,
        private router: Router,
        private authService: AuthService
    ) {}

    loginUser(userData: any) {
        this.http.post<LoginResponse>(`login/`, userData)
            .subscribe({
                next: (resData) => {
                    if (resData != null) {
                        this.authService.login((resData as LoginResponse).token, (resData as LoginResponse).id, (resData as LoginResponse).userRole);
                        this.redirectToHome();
                    }
                },
                error: (error) => {
                    if (error.error) {
                        alert(error.error);
                    } else {
                        alert('An unexpected error occurred during login.');
                    }
                    console.error('Login error:', error);
                },
                complete: () => {
                    console.log('Login process complete');
                }
            });
    }

    logoutUser() {
        this.authService.logout();
        this.router.navigate(['login']);
    }

    redirectToHome() {
        this.router.navigate(['accounts']);
    }
}
