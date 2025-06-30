package com.aciworldwide.aclabs22.services;

import com.aciworldwide.aclabs22.dto.TransactionDTO;
import com.aciworldwide.aclabs22.entities.AccountModel;
import com.aciworldwide.aclabs22.entities.TransactionModel;
import com.aciworldwide.aclabs22.repositories.AccountRepository;
import com.aciworldwide.aclabs22.repositories.TransactionRepository;
import com.aciworldwide.aclabs22.validators.TransactionValidator;
import com.aciworldwide.aclabs22.validators.ValidationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
@RequiredArgsConstructor
@Log4j2
public class TransactionProcessor {

    private final TransactionValidator transactionValidator;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    @Retryable(
        value = {
                org.hibernate.exception.LockAcquisitionException.class,
                org.springframework.dao.CannotAcquireLockException.class
        },
        maxAttempts = 5,
        backoff = @Backoff(delay = 500, multiplier = 2)
    )
    @Transactional
    public ResponseEntity<?> processTransaction(TransactionDTO dto) {
        ValidationResult result = transactionValidator.validate(dto);

        if (!result.isValid() && !result.isBusinessFailure()) {
            log.error("Structural fail: {}", result.getMessage());
            return ResponseEntity.badRequest().body(result);
        }

        TransactionModel transaction = new TransactionModel(dto);
        transaction.setReturnCode(result.getCode());
        transactionRepository.save(transaction);
        log.info("Transaction saved: {}", transaction.getId());

        if (result.isBusinessFailure()) {
            return ResponseEntity.ok(result);
        }

        AccountModel account = accountRepository.findAccountByCardNumber(dto.getCardNumber());
        if (account == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
        }

        updateAccount(account, dto.getAmount());
        accountRepository.save(account);

        return ResponseEntity.ok(result);
    }

    private void updateAccount(AccountModel account, Double amount) {
        account.setAmount(account.getAmount() - amount);
        account.setDailyTx(account.getDailyTx() + 1);
        account.setDailyTxSum(account.getDailyTxSum() + amount);
    }
}
