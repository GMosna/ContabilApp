package com.example.loginauthapi.services;

import com.example.loginauthapi.domain.Account;
import com.example.loginauthapi.domain.Movement;
import com.example.loginauthapi.dto.AccountDTO;
import com.example.loginauthapi.dto.AccountRequestDTO;
import com.example.loginauthapi.dto.AccountResponseDTO;
import com.example.loginauthapi.dto.AccountResponseFullDTO;
import com.example.loginauthapi.repositories.AccountRepository;
import com.example.loginauthapi.repositories.MovementRepository;
import com.example.loginauthapi.services.exceptions.BusinessException;
import com.example.loginauthapi.services.exceptions.DatabaseException;
import com.example.loginauthapi.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;

@Service
public class AccountService {

    @Autowired
    private AccountRepository repository;

    @Autowired
    private MovementRepository movementRepository;

    public Account newAccount(AccountRequestDTO dto) {
        Account account = new Account();
        account.setName(dto.name());
        account.setBank(dto.bank());
        account.setCpf(dto.cpf());
        account.setBalance(dto.balance());

        if (isMaiorDeIdade(dto.dateOfBirth())) {
            account.setDateOfBirth(dto.dateOfBirth());
        } else {
            throw new IllegalArgumentException("Usuário deve ter pelo menos 18 anos.");
        }

        if(account.getBalance() == null) {
            account.setBalance(BigDecimal.valueOf(0.00));
        }

        return repository.save(account);
    }

    private boolean isMaiorDeIdade(LocalDate dataNascimento) {
        return Period.between(dataNascimento, LocalDate.now()).getYears() >= 18;
    }

    //lista todos as contas criadas
    public List<AccountResponseDTO> getAccounts() {
        List<Account> accounts = repository.findAll();
        return accounts.stream().map(account -> new AccountResponseDTO(account.getId(), account.getName(), account.getBank(), account.getBalance()))
                .toList();
    }

    //lista a conta criada pelo ID passado na URL
    public AccountResponseFullDTO findById(Long id) {
        Account account = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        return new AccountResponseFullDTO(
                account.getName(),
                account.getCpf(),
                account.getDateOfBirth(),
                account.getBank(),
                account.getBalance()
        );
    }

    //altera o dado da conta
    private void updateData(Account account, Account obj) {
        account.setName(obj.getName());
        account.setBank(obj.getBank());
        account.setCpf(obj.getCpf());
        account.setBalance(obj.getBalance());

        if (isMaiorDeIdade(obj.getDateOfBirth())) {
            account.setDateOfBirth(obj.getDateOfBirth());
        } else {
            throw new IllegalArgumentException("Usuário deve ter pelo menos 18 anos.");
        }

        if (account.getBalance() == null) {
            account.setBalance(BigDecimal.valueOf(0.00));
        }
    }

    @Transactional
    public Account update(Long id, AccountDTO dto) {
        try {
            Account account = repository.getReferenceById(id);
            Account newData = convertDTOToAccount(dto);
            updateData(account, newData);
            return repository.save(account);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException(id);
        }
    }

    //converte DTO em Account
    private Account convertDTOToAccount(AccountDTO dto) {
        Account account = new Account();
        account.setName(dto.name());
        account.setCpf(dto.cpf());
        account.setBank(dto.bank());
        account.setDateOfBirth(dto.dateOfBirth());
        account.setBalance(dto.balance());
        return account;
    }

    //deleta a conta
    public void deleteAccount(Long id) {
        try {
            repository.deleteById(id);
        } catch (EmptyResultDataAccessException e) {
            throw new ResourceNotFoundException(id);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(e.getMessage());
        }
    }

    @Autowired
    public AccountService(AccountRepository accountRepository, MovementRepository movementRepository) {
        this.repository = accountRepository;
        this.movementRepository = movementRepository;
    }

    //realiza depósito
    @Transactional
    public Account realizaDeposito(Long id, BigDecimal value) {
        Account account = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        account.setBalance(account.getBalance().add(value));
        repository.save(account);

        Movement movement = new Movement(
                id,
                "DEPOSIT",
                value,
                LocalDateTime.now()
        );
        movementRepository.save(movement);

        return account;
    }

    //realiza saque
    @Transactional
    public Account realizaSaque(Long id, BigDecimal value) {
        Account account = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        if (account.getBalance().compareTo(value) < 0) {
            throw new BusinessException("Saldo insuficiente para saque.");
        }

        account.setBalance(account.getBalance().subtract(value));
        repository.save(account);

        Movement movement = new Movement(
                id,
                "WITHDRAW",
                value,
                LocalDateTime.now()
        );
        movementRepository.save(movement);

        return account;
    }

}
