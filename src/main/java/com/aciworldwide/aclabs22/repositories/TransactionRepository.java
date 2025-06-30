package com.aciworldwide.aclabs22.repositories;

import com.aciworldwide.aclabs22.entities.TransactionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;


import java.util.Optional;

import java.util.List;

import java.util.UUID;

//JPA repository extends CrudRepository and PagingAndSortingRepository
@Repository
public interface TransactionRepository extends JpaRepository<TransactionModel, UUID> {

    Page<TransactionModel> findAllByCardNumber(String cardNumber, Pageable pageable);
    Page<TransactionModel> findAll(Pageable pageable);


    Optional<TransactionModel> findById(long id);

    List<TransactionModel> findAllByCardNumber(String cardNumber);
    List<TransactionModel> findAllByCardNumberAndReturnCode(String cardNumber, String returnCode);



}
