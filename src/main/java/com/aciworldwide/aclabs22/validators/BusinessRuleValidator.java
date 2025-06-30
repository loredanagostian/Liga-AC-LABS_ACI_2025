package com.aciworldwide.aclabs22.validators;

import com.aciworldwide.aclabs22.dto.TransactionDTO;
import com.aciworldwide.aclabs22.entities.AccountModel;
import com.aciworldwide.aclabs22.enums.AccountStatus;
import com.aciworldwide.aclabs22.enums.TransactionResponseCode;
import com.aciworldwide.aclabs22.helpers.ValidationHelper;
import org.springframework.stereotype.Component;

@Component
public class BusinessRuleValidator {
    public ValidationResult validate(AccountModel account, TransactionDTO dto) {
        if (account == null) {
            return ValidationHelper.logFailure(TransactionResponseCode.CARD_HOLDER_NOT_FOUND);
        }

        if (account.getAccountStatus() != AccountStatus.ACTIVE) {
            return ValidationHelper.logFailure(TransactionResponseCode.ACCOUNT_NOT_ACTIVE);
        }

        if (account.getAmount() < dto.getAmount()) {
            return ValidationHelper.logSuccess(TransactionResponseCode.AMOUNT_EXCEEDED);
        }

        if (account.dailyTxLimitExceeded()) {
            return ValidationHelper.logSuccess(TransactionResponseCode.DAILY_TX_LIMIT_EXCEEDED);
        }

        if (account.dailyTxSumLimitExceeded()) {
            return ValidationHelper.logSuccess(TransactionResponseCode.DAILY_TX_SUM_EXCEEDED);
        }

        if (account.willDailyTxSumLimitExceed(dto.getAmount())) {
            return ValidationHelper.logSuccess(TransactionResponseCode.DAILY_TX_SUM_WILL_BE_EXCEEDED);
        }

        return ValidationHelper.logSuccess(TransactionResponseCode.APPROVED);
    }
}