import { Component } from '@angular/core';
import { UserService } from './utils/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private userService: UserService) {}

  logout() {
    this.userService.logoutUser();
  }
}
