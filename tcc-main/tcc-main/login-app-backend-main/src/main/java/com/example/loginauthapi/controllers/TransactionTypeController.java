package com.example.loginauthapi.controllers;

import com.example.loginauthapi.domain.TransactionType;
import com.example.loginauthapi.services.TransactionTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/transaction-types")
public class TransactionTypeController {

    @Autowired
    private TransactionTypeService service;

    @PostMapping
    public ResponseEntity<TransactionType> insert(@RequestBody TransactionType obj){
        obj = service.newTransactionType(obj);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(obj.getId()).toUri();
        return ResponseEntity.created(uri).body(obj);
    }

    @GetMapping
    public ResponseEntity<List<TransactionType>> findAll(){
        List<TransactionType> list = service.findAll();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<TransactionType> findById(@PathVariable Long id){
        TransactionType transactionType = service.findById(id);
        return ResponseEntity.ok().body(transactionType);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<TransactionType> update(@PathVariable Long id, @RequestBody TransactionType transactionType){
        transactionType = service.update(id, transactionType);
        return ResponseEntity.ok().body(transactionType);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
