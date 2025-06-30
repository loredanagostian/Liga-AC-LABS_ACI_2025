package com.aciworldwide.aclabs22.controllers;

import com.aciworldwide.aclabs22.dto.AccountDTO;
import com.aciworldwide.aclabs22.entities.AccountModel;
import com.aciworldwide.aclabs22.entities.TransactionModel;
import com.aciworldwide.aclabs22.services.AccountService;
import com.aciworldwide.aclabs22.services.TransactionService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@AllArgsConstructor
@ControllerAdvice
@RestController
@RequestMapping(path = "/accounts/v1")
public class AccountController {

    AccountService accountService;
    TransactionService transactionService;

    @GetMapping("/")
    public List<AccountModel> getAllAccounts() {
        return accountService.getAllAccounts();
    }

    @GetMapping("/transactionsPagination")
    public ResponseEntity<Page<TransactionModel>>getAllTransactionsPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(transactionService.getAllTransactionsPagination(pageable));
    }
    @GetMapping("/transactionsPagination/{cardNumber}")
    public ResponseEntity<Page<TransactionModel>> getTransactionsPaginationOfAccount(
            @PathVariable String cardNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionModel> transactions = transactionService.getTransactionsPaginationOfAccount(cardNumber, pageable);
        return ResponseEntity.ok(transactions);
    }
    @GetMapping("/transactions/")
    public ResponseEntity<List<TransactionModel>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/transactions/{cardNumber}")
    public ResponseEntity<List<TransactionModel>> getTransactionsOfAccount(@PathVariable String cardNumber) {
        return ResponseEntity.ok(transactionService.getTransactionsOfAccount(cardNumber));
    }

    @GetMapping("/transactions/{cardNumber}/status/{returnCode}")
    public ResponseEntity<List<TransactionModel>> getTransactionsOfAccountByStatus(
            @PathVariable String cardNumber,
            @PathVariable String returnCode) {
        return ResponseEntity.ok(transactionService.getTransactionsOfAccountByStatus(cardNumber, returnCode));
    }



    @GetMapping("/{cardNumber}")
    public ResponseEntity<?> getAccount(@PathVariable String cardNumber) {
        return accountService.getAccount(cardNumber);
    }

    @PostMapping
    public ResponseEntity<?> addAccount(@RequestBody AccountDTO accountDTO) {
        return accountService.addAccount(accountDTO);
    }

    @PutMapping("{cardNumber}")
    public ResponseEntity<?> updateAccount(
            @PathVariable("cardNumber") String cardNumber,
            @RequestBody AccountDTO accountDTO)    {
        return accountService.updateAccount(cardNumber, accountDTO);
    }

    @DeleteMapping("/delete/{cardNumber}")
    public ResponseEntity<?> deleteAccount(@PathVariable String cardNumber) {
        return accountService.deleteAccount(cardNumber);
    }
}
