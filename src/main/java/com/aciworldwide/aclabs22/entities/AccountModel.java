package com.aciworldwide.aclabs22.entities;

import com.aciworldwide.aclabs22.dto.AccountDTO;
import com.aciworldwide.aclabs22.enums.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "ACCOUNTS")
public class AccountModel {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(unique = true)
    private String cardNumber;

    private String cardHolderName;
    private Double amount;
    private int dailyTxLimit;
    private double dailyTxSumLimit;
    private int dailyTx;
    private double dailyTxSum;

    @Enumerated(EnumType.STRING)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    public AccountModel(AccountDTO accountDTO) {
        this.cardNumber = accountDTO.getCardNumber();
        this.cardHolderName = accountDTO.getCardHolderName();
        this.amount = accountDTO.getAmount();
        this.dailyTxLimit = accountDTO.getDailyTxLimit();
        this.dailyTxSumLimit = accountDTO.getDailyTxSumLimit();
        this.dailyTx = accountDTO.getDailyTx();
        this.dailyTxSum = accountDTO.getDailyTxSum();
    }

    public boolean dailyTxLimitExceeded() {
        return dailyTx >= dailyTxLimit;
    }

    public boolean dailyTxSumLimitExceeded() {
        return dailyTxSum >= dailyTxSumLimit;
    }

    public boolean willDailyTxSumLimitExceed(double txAmount) {
        return dailyTxSum + txAmount >= dailyTxSumLimit;
    }
}
