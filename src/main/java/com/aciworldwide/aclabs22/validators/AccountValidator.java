package com.aciworldwide.aclabs22.validators;

import com.aciworldwide.aclabs22.dto.AccountDTO;
import com.aciworldwide.aclabs22.repositories.AccountRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class AccountValidator {

    private final AccountRepository accountRepository;

    public boolean validateAccount(AccountDTO accountDTO) {
        return accountDTO != null && accountDTO.getCardNumber() != null && !accountRepository.existsAccountByCardNumber(accountDTO.getCardNumber());
    }
}
