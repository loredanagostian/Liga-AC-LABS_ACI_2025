package com.aciworldwide.aclabs22.enums;

public enum UserRoles {
    ADMIN, /// can view/edit everything
    ANALYST, /// can view GetAccounts, GetTransactions, ShowTransactions
    SUPPORT, /// can view GetAccounts, GetTransactions, ShowTransactions and can CreateTransaction
    UNDEFINED /// can view only LogOut
}
