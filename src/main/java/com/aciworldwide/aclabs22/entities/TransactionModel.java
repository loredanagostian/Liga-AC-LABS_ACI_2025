package com.aciworldwide.aclabs22.entities;

import com.aciworldwide.aclabs22.dto.TransactionDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.sql.Timestamp;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "TRANSACTIONS")
public class TransactionModel {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    private String cardNumber;
    private Double amount;
    private Timestamp timestamp;
    private String returnCode;
    @Column(name = "retried", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean retried;

    public TransactionModel(TransactionDTO transactionDTO){
        this.amount = transactionDTO.getAmount();
        this.timestamp = transactionDTO.getTimestamp();
        this.cardNumber = transactionDTO.getCardNumber();
        this.retried = false;
    }

}
