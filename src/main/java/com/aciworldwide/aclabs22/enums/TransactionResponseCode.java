package com.aciworldwide.aclabs22.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TransactionResponseCode {
    //success
    APPROVED("00", "Transaction approved"),
    //structural codes 10 to 29
    INVALID_AMOUNT("13", "Invalid amount"),
    INVALID_CARD_NUMBER("14", "Invalid card number"),
    LUHN_ALGORITHM_FAILED("15", "Card number failed on Luhn algorithm."),
    NULL_VALUE("16", "Null value passed to the transaction"),
    INVALID_CARD_NUMBER_LENGTH("17", "Invalid card number length"),
    //business codes from 30 to 50
    AMOUNT_EXCEEDED("31", "Insufficient funds in your account."),
    CARD_HOLDER_NOT_FOUND("32", "Card holder not found"),
    DAILY_TX_LIMIT_EXCEEDED("33", "Daily transaction limit exceeded"),
    DAILY_TX_SUM_EXCEEDED("34", "Daily transaction sum is exceeded"),
    DAILY_TX_SUM_WILL_BE_EXCEEDED("35", "Daily transaction sum will be exceeded"),
    ACCOUNT_NOT_ACTIVE("36", "Account is not active");

    private final String code;
    private final String message;
}