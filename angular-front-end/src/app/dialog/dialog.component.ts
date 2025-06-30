import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FrontEndService} from "../utils/front-end.service";


@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements  OnInit{
    @Output() transactionMade = new EventEmitter<void>();
    constructor(private dialogRef: MatDialogRef<DialogComponent>,
                private frontEndService: FrontEndService,
                @Inject(MAT_DIALOG_DATA) public data: any) {

    }
    cardNumber: string = '';
    transactionAmount: number = 0;
    cardHolderName: string = '';
    ngOnInit(): void {
        this.cardNumber = this.data.selectedAccount.cardNumber;
        this.cardHolderName = this.data.selectedAccount.cardHolderName;

    }



  addTransaction() {
      this.frontEndService.addTransaction({
            cardNumber: this.cardNumber,
            amount: this.transactionAmount,
            timestamp: new Date().toISOString()
        }).subscribe({
          next: (data) => {
              console.log("success data", data);
              if(data.code === "00"){
                  this.transactionMade.emit();
                  this.dialogRef.close();
                  alert("Transaction successful");

              }
              else{
                  alert("Transaction failed: " + data.message);
              }
          },
              error: (error) => {
              console.log("error data", error);
              alert("Transaction failed: " + (error.error?.message || "Unknown error"));
          }

        })


}


    validateTransactionNumber(event: Event) {

        const inputElement = event.target as HTMLInputElement;

        let currentValue = parseFloat(inputElement.value);


        if (currentValue < 0) {
            this.transactionAmount = 0;
            inputElement.value = '0';
        }

        else if (currentValue > 1000000000) {
            this.transactionAmount = 1000000000;
            inputElement.value = '1000000000';
        }

    }

    onClose() {
        this.dialogRef.close();
    }






}
