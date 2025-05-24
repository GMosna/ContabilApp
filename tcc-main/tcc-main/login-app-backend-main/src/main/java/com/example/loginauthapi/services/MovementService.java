package com.example.loginauthapi.services;

import com.example.loginauthapi.domain.Movement;
import com.example.loginauthapi.repositories.MovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovementService {

    @Autowired
    private MovementRepository movementRepository;

    public List<Movement> getMovementsByAccount(Long accountId) {
        return movementRepository.findByAccountId(accountId);
    }
}