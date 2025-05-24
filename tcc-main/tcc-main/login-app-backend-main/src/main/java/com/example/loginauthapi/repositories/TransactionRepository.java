package com.example.loginauthapi.repositories;

import com.example.loginauthapi.domain.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}
