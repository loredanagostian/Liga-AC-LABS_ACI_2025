package com.aciworldwide.aclabs22.services;

import com.aciworldwide.aclabs22.dto.TransactionDTO;
import com.aciworldwide.aclabs22.entities.TransactionModel;
import com.aciworldwide.aclabs22.repositories.TransactionRepository;
import com.aciworldwide.aclabs22.repositories.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;


import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Log4j2
@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final TransactionProcessor transactionProcessor;

    @Async("transactionExecutor")
    public CompletableFuture<ResponseEntity<?>> processTransactionAsync(TransactionDTO dto) {
        try {
            ResponseEntity<?> result = transactionProcessor.processTransaction(dto); // now transactional
            return CompletableFuture.completedFuture(result);
        } catch (Exception e) {
            log.error("Async transaction failed", e);
            return CompletableFuture.completedFuture(
                    ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Error: " + e.getMessage())
            );
        }
    }



    // Pagination methods
    public Page<TransactionModel> getAllTransactionsPagination(Pageable pages) {
        return transactionRepository.findAll(pages);
    }

    public Page<TransactionModel> getTransactionsPaginationOfAccount(String cardNumber, Pageable pages) {
        return transactionRepository.findAllByCardNumber(cardNumber, pages);
    }

    // List all transactions (no pagination)
    public List<TransactionModel> getAllTransactions() {
        return transactionRepository.findAll();
    }

    // List transactions for an account
    public List<TransactionModel> getTransactionsOfAccount(String cardNumber) {
        return transactionRepository.findAllByCardNumber(cardNumber);
    }

    // List transactions filtered by card number and return code
    public List<TransactionModel> getTransactionsOfAccountByStatus(String cardNumber, String returnCode) {
        return transactionRepository.findAllByCardNumberAndReturnCode(cardNumber, returnCode);
    }


    // Return DTOs for anomaly detection
    public List<TransactionDTO> getAllTransactionsForAnomaly() {
        List<TransactionModel> transactions = transactionRepository.findAll();
        return transactions.stream()
                .map(tm -> {
                    TransactionDTO dto = new TransactionDTO();
                    BeanUtils.copyProperties(tm, dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
