package com.example.loginauthapi.repositories;

import com.example.loginauthapi.domain.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionTypeRepository extends JpaRepository<TransactionType, Long> {
    Optional<TransactionType> findByTransactionType(String transactionType);
}
