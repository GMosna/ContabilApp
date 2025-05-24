package com.example.loginauthapi.controllers;

import com.example.loginauthapi.domain.Movement;
import com.example.loginauthapi.services.MovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/movements")
public class MovementController {

    @Autowired
    private MovementService movementService;

    @GetMapping("/{id}")
    public ResponseEntity<List<Movement>> getMovements(@PathVariable Long id) {
        List<Movement> movements = movementService.getMovementsByAccount(id);
        return ResponseEntity.ok(movements);
    }
}

