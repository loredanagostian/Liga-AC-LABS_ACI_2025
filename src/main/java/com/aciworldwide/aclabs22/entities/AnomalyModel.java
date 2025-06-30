package com.aciworldwide.aclabs22.entities;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class AnomalyModel {
    private String cardNumber;
    private Double amount;
    private Timestamp timestamp;
    private String reason;
}
