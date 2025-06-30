import {Component} from '@angular/core';
import {FrontEndService} from "../utils/front-end.service";

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent{

    user: any = {}

    constructor(private frontEndService: FrontEndService) { }

    onSubmit(){
        this.frontEndService.createUserAccount(this.user).subscribe({
            next: (resData) => {
                if (resData.token && resData.id) {
                    alert("Account created successfully");

                    this.user = {
                        username: '',
                        password: '',
                        confirmPassword: '',
                        userRole: ''
                    };
                }
            },
            error: (error) => {
                if (error.error) {
                    alert(error.error);
                } else {
                    alert('An unexpected error occurred during register.');
                }
                console.error('Register error:', error);
            },
            complete: () => {
                console.log('Register process complete');
            }
        });
    }
}
