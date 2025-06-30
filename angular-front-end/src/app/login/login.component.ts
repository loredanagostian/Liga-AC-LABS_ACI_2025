import { Component, OnInit } from '@angular/core';
import { UserService } from "../utils/user.service";
import { AuthService } from "../utils/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  user: any = {}

  constructor(
      private userService: UserService,
      private authService: AuthService
  ) { }

  onSubmit() {
    this.userService.loginUser(this.user);
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.userService.redirectToHome();
    }
  }
}
