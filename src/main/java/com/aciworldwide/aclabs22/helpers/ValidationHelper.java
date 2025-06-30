package com.aciworldwide.aclabs22.helpers;

import com.aciworldwide.aclabs22.enums.TransactionResponseCode;
import com.aciworldwide.aclabs22.validators.ValidationResult;
import lombok.extern.log4j.Log4j2;

@Log4j2
public class ValidationHelper {
    static public ValidationResult logFailure(TransactionResponseCode responseCode) {
        log.error("Validation failed with status: {} and message: {}", responseCode, responseCode.getMessage());
        return ValidationResult.failure(responseCode);
    }

    static public ValidationResult logSuccess(TransactionResponseCode responseCode) {
        log.info("Validation succeeded with status: {} and message: {}", responseCode, responseCode.getMessage());
        return ValidationResult.success(responseCode);
    }
}
