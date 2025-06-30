package com.aciworldwide.aclabs22.validators;

import com.aciworldwide.aclabs22.dto.TransactionDTO;
import com.aciworldwide.aclabs22.entities.AccountModel;
import com.aciworldwide.aclabs22.repositories.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TransactionValidator {
    private final StructuralValidator structuralValidator;
    private final BusinessRuleValidator businessRuleValidator;
    private final AccountRepository accountRepository;

    public ValidationResult validate(TransactionDTO dto) {
        ValidationResult structureCheck = structuralValidator.validate(dto);
        if (!structureCheck.isValid()) {
            return structureCheck;
        }

        AccountModel account = accountRepository.findAccountByCardNumber(dto.getCardNumber());

        return businessRuleValidator.validate(account, dto);
    }
}