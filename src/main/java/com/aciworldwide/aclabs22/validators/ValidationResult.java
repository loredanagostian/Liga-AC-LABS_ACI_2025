package com.aciworldwide.aclabs22.validators;

import com.aciworldwide.aclabs22.enums.TransactionResponseCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ValidationResult {

    private final boolean isValid;
    private final String code;
    private final String message;


    public static ValidationResult success(TransactionResponseCode responseCode) {
        return new ValidationResult(true, responseCode.getCode(), responseCode.getMessage());
    }

    public static ValidationResult failure(TransactionResponseCode responseCode) {
        return new ValidationResult(false, responseCode.getCode(), responseCode.getMessage());
    }

    public boolean isBusinessFailure() {
        try {
            int code = Integer.parseInt(this.code);
            return isValid && code >= 30 && code <= 49;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}