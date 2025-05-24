package com.example.loginauthapi.controllers;

import com.example.loginauthapi.domain.Account;
import com.example.loginauthapi.dto.*;
import com.example.loginauthapi.services.AccountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/account")
public class AccountController {

    @Autowired
    private AccountService service;

    //cadastra uma conta
    @PostMapping
    public ResponseEntity<Account> insert(@RequestBody @Valid AccountRequestDTO account) {
        Account newAccount = service.newAccount(account);
        return ResponseEntity.ok(newAccount);
    }

    //lista as contas cadastradas
    @GetMapping
    public ResponseEntity<List<AccountResponseDTO>> getAccounts() {
        List<AccountResponseDTO> allAccounts = service.getAccounts();
        return ResponseEntity.ok(allAccounts);
    }

    //lista conta por id
    @GetMapping("/{id}")
    public ResponseEntity<AccountResponseFullDTO> findById(@PathVariable Long id) {
        AccountResponseFullDTO responseFullDTO = service.findById(id);
        return ResponseEntity.ok(responseFullDTO);
    }

    //atualiza a conta
    @PutMapping("/{id}")
    public ResponseEntity<Account> update(@PathVariable Long id, @RequestBody AccountDTO dto) {
        Account updatedAccount = service.update(id, dto);
        return ResponseEntity.ok().body(updatedAccount);
    }

    //deleta a conta
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }

    //realiza depósito
    @PatchMapping("/{id}/deposito")
    public ResponseEntity<Account> deposito(@PathVariable Long id, @RequestBody @Valid DepositoRequestDTO dto) {
        Account account = service.realizaDeposito(id, dto.value());
        return ResponseEntity.ok(account);
    }

    //realiza saque
    @PatchMapping("/{id}/saque")
    public ResponseEntity<Account> saque(@PathVariable Long id, @RequestBody @Valid SaqueRequestDTO dto) {
        Account account = service.realizaSaque(id, dto.value());
        return ResponseEntity.ok(account);
    }
}
