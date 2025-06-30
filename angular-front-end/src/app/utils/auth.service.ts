import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    login(token: string, userId: number, userRole: string): void {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId.toString());
        localStorage.setItem('userRole', userRole);
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
    }

    isLoggedIn(): boolean {
        return localStorage.getItem('token') !== null;
    }
}
