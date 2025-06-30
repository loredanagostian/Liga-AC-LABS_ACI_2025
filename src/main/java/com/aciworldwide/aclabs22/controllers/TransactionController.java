package com.aciworldwide.aclabs22.controllers;


import com.aciworldwide.aclabs22.dto.TransactionDTO;
import com.aciworldwide.aclabs22.entities.TransactionModel;
import com.aciworldwide.aclabs22.services.TransactionService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;


import java.util.List;

@Log4j2
@AllArgsConstructor
@RestController
@RequestMapping(path = "/payments")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping(path = "/")
    public ResponseEntity<?> processTransaction(@RequestBody TransactionDTO transactionDto) {
        try {
            CompletableFuture<ResponseEntity<?>> resultFuture =
                    transactionService.processTransactionAsync(transactionDto);

            return resultFuture.get();
        } catch (Exception e) {
            log.error("Transaction failed", e);
            return ResponseEntity.status(500).body("Internal error");
        }
    }

    @PutMapping(path = "/{id}")
    public ResponseEntity<?> updateTransaction(
            @PathVariable("id") Long id,
            @RequestBody TransactionModel transactionModel) {
        log.info("Received update transaction request: {}", id);
        return transactionService.updateTransaction(id, transactionModel);
    }


}
