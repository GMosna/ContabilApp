package com.example.loginauthapi.controllers;

import com.example.loginauthapi.dto.TransactionDTO;
import com.example.loginauthapi.dto.TransactionRequestDTO;
import com.example.loginauthapi.domain.Transaction;
import com.example.loginauthapi.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/transactions")
public class TransactionController {

    @Autowired
    private TransactionService service;

    @PostMapping
    public ResponseEntity<Transaction> insert(@RequestBody TransactionRequestDTO dto) {
        Transaction transaction = service.newTransaction(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> findAll(){
        List<TransactionDTO> list = service.findAllDto();
        return ResponseEntity.ok().body(list);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<TransactionDTO> findById(@PathVariable Long id){
        Transaction transaction = service.findById(id);
        TransactionDTO transactionDTO = new TransactionDTO(transaction);
        return ResponseEntity.ok().body(transactionDTO);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Transaction> update(@PathVariable Long id, @RequestBody TransactionRequestDTO dto) {
        Transaction transaction = service.update(id, dto);
        return ResponseEntity.ok().body(transaction);
    }
}