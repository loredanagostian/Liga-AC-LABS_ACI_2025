package com.aciworldwide.aclabs22.validators;

import com.aciworldwide.aclabs22.dto.TransactionDTO;
import com.aciworldwide.aclabs22.enums.TransactionResponseCode;
import com.aciworldwide.aclabs22.helpers.ValidationHelper;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

@Component
public class StructuralValidator {
    private static final int CARD_NUMBER_LENGTH = 16;

    public ValidationResult validate(TransactionDTO dto) {
        if (dto.getAmount() == null || dto.getCardNumber() == null) {
            return ValidationHelper.logFailure(TransactionResponseCode.NULL_VALUE);
        }

        if (dto.getAmount() < 0) {
            return ValidationHelper.logFailure(TransactionResponseCode.INVALID_AMOUNT);
        }

        if (dto.getCardNumber().length() != CARD_NUMBER_LENGTH) {
            return ValidationHelper.logFailure(TransactionResponseCode.INVALID_CARD_NUMBER_LENGTH);
        }

        if (!StringUtils.isNumeric(dto.getCardNumber())) {
            return ValidationHelper.logFailure(TransactionResponseCode.INVALID_CARD_NUMBER);
        }

        if (!isValidLuhn(dto.getCardNumber())) {
            return ValidationHelper.logFailure(TransactionResponseCode.LUHN_ALGORITHM_FAILED);
        }

        return ValidationResult.success(TransactionResponseCode.APPROVED);
    }

    private boolean isValidLuhn(String cardNumber) {
        int sum = 0;
        boolean shouldDouble = false;

        for (int i = cardNumber.length() - 1; i >= 0; i--) {
            int digit = Integer.parseInt(cardNumber.substring(i, i + 1));
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }

        return (sum % 10) == 0;
    }
}