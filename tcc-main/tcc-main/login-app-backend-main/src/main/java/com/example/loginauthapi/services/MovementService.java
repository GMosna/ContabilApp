package com.example.loginauthapi.services;

import com.example.loginauthapi.domain.Account;
import com.example.loginauthapi.domain.Movement;
import com.example.loginauthapi.repositories.AccountRepository;
import com.example.loginauthapi.repositories.MovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovementService {

    @Autowired
    private MovementRepository movementRepository;

    @Autowired
    private AccountRepository accountRepository;

    public List<Movement> getMovementsByAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada: " + accountId));
        return movementRepository.findByAccount(account);
    }
}