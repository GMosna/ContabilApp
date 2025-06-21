package com.example.loginauthapi.services;

import com.example.loginauthapi.dto.TransactionDTO;
import com.example.loginauthapi.dto.TransactionRequestDTO;
import com.example.loginauthapi.domain.Category;
import com.example.loginauthapi.domain.Transaction;
import com.example.loginauthapi.domain.TransactionType;
import com.example.loginauthapi.domain.User;
import com.example.loginauthapi.domain.Account;
import com.example.loginauthapi.domain.Movement;
import com.example.loginauthapi.repositories.CategoryRepository;
import com.example.loginauthapi.repositories.TransactionRepository;
import com.example.loginauthapi.repositories.TransactionTypeRepository;
import com.example.loginauthapi.repositories.UserRepository;
import com.example.loginauthapi.repositories.MovementRepository;
import com.example.loginauthapi.services.exceptions.DatabaseException;
import com.example.loginauthapi.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionTypeRepository transactionTypeRepository;

    @Autowired
    private AccountService accountService;

    @Autowired
    private MovementRepository movementRepository;

    @Transactional
    public Transaction newTransaction(TransactionRequestDTO dto) {
        // Buscar o User pelo ID
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Buscar a Category pelo ID
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Buscar o TransactionType pelo ID
        TransactionType transactionType = transactionTypeRepository.findById(dto.getTransactionTypeId())
                .orElseThrow(() -> new RuntimeException("Transaction Type not found"));

        // Lidar com a conta, pode ser nulo para dinheiro em espécie
        Account account = null;
        if (dto.getAccountId() != null) {
            account = accountService.findAccountById(dto.getAccountId()); // Usar o novo método
        }

        // Criar a nova transação
        Transaction transaction = new Transaction();
        transaction.setDescription(dto.getDescription());
        transaction.setAmount(dto.getAmount());
        transaction.setDate(dto.getDate());
        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setTransactionType(transactionType);
        transaction.setAccount(account); // Definir a conta na transação

        // Salvar a transação primeiro para obter o ID se necessário para movements, embora o AccountService já crie movements
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Atualizar o saldo da conta e criar Movement se necessário
        if (account != null) {
            if (transactionType.getTransactionType().equalsIgnoreCase("INCOME")) {
                accountService.realizaDeposito(account.getId(), dto.getAmount());
                // Criar Movement correspondente
                Movement movement = new Movement(account, "DEPOSIT", dto.getAmount(), dto.getDate() != null ? dto.getDate() : LocalDateTime.now());
                movementRepository.save(movement);
            } else if (transactionType.getTransactionType().equalsIgnoreCase("EXPENSE")) {
                accountService.realizaSaque(account.getId(), dto.getAmount());
                // Criar Movement correspondente
                Movement movement = new Movement(account, "WITHDRAW", dto.getAmount(), dto.getDate() != null ? dto.getDate() : LocalDateTime.now());
                movementRepository.save(movement);
            }
        }

        // Retornar a transação salva
        return savedTransaction;
    }


    public List<TransactionDTO> findAllDto(){
        List<Transaction> transactions = transactionRepository.findAll();
        return transactions.stream()
                .map(transaction -> new TransactionDTO(transaction))
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id){
        try {
            // Buscar a transação antes de excluir para reverter o impacto no saldo da conta
            Transaction transactionToDelete = transactionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

            if (transactionToDelete.getAccount() != null) {
                Account account = transactionToDelete.getAccount();
                BigDecimal amount = transactionToDelete.getAmount();
                String transactionType = transactionToDelete.getTransactionType().getTransactionType();

                if (transactionType.equalsIgnoreCase("INCOME")) {
                    accountService.realizaSaque(account.getId(), amount); // Reverter receita
                } else if (transactionType.equalsIgnoreCase("EXPENSE")) {
                    accountService.realizaDeposito(account.getId(), amount); // Reverter despesa
                }
            }

            transactionRepository.deleteById(id);
        } catch (EmptyResultDataAccessException e){
            throw new ResourceNotFoundException(id);
        } catch (DataIntegrityViolationException e){
            throw new DatabaseException(e.getMessage());
        }
    }

    public Transaction findById(Long id){
        Optional<Transaction> transaction = transactionRepository.findById(id);
        return transaction.orElseThrow(() -> new ResourceNotFoundException(id));
    }

    public void updateData(Transaction transaction, Transaction obj){
        transaction.setTransactionType(obj.getTransactionType());
        transaction.setDate(obj.getDate());
        transaction.setAmount(obj.getAmount());
        transaction.setDescription(obj.getDescription());
        transaction.setUser(obj.getUser());
        transaction.setCategory(obj.getCategory());
    }


    @Transactional
    public Transaction update(Long id, TransactionRequestDTO dto) {
        try {
            // Buscar a transação existente pelo ID
            Transaction existingTransaction = transactionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

            // Reverter o impacto da transação original no saldo da conta, se houver
            if (existingTransaction.getAccount() != null) {
                Account originalAccount = existingTransaction.getAccount();
                BigDecimal originalAmount = existingTransaction.getAmount();
                String originalTransactionType = existingTransaction.getTransactionType().getTransactionType();

                if (originalTransactionType.equalsIgnoreCase("INCOME")) {
                    accountService.realizaSaque(originalAccount.getId(), originalAmount); // Reverter receita
                } else if (originalTransactionType.equalsIgnoreCase("EXPENSE")) {
                    accountService.realizaDeposito(originalAccount.getId(), originalAmount); // Reverter despesa
                }
            }

            // Buscar o User pelo ID fornecido no DTO
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));

            // Buscar a Category pelo ID fornecido no DTO
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

            // Buscar o TransactionType pelo ID fornecido no DTO
            TransactionType transactionType = transactionTypeRepository.findById(dto.getTransactionTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("TransactionType not found with id: " + dto.getTransactionTypeId()));

            // Lidar com a nova conta, pode ser nulo para dinheiro em espécie
            Account newAccount = null;
            if (dto.getAccountId() != null) {
                newAccount = accountService.findAccountById(dto.getAccountId());
            }

            // Atualizar os dados da transação
            existingTransaction.setDescription(dto.getDescription());
            existingTransaction.setAmount(dto.getAmount());
            existingTransaction.setDate(dto.getDate());
            existingTransaction.setTransactionType(transactionType);
            existingTransaction.setUser(user);
            existingTransaction.setCategory(category);
            existingTransaction.setAccount(newAccount); // Definir a nova conta

            // Salvar a transação atualizada
            Transaction updatedTransaction = transactionRepository.save(existingTransaction);

            // Aplicar o impacto da nova transação no saldo da conta
            if (newAccount != null) {
                if (transactionType.getTransactionType().equalsIgnoreCase("INCOME")) {
                    accountService.realizaDeposito(newAccount.getId(), dto.getAmount());
                } else if (transactionType.getTransactionType().equalsIgnoreCase("EXPENSE")) {
                    accountService.realizaSaque(newAccount.getId(), dto.getAmount());
                }
            }

            // Retornar a transação atualizada
            return updatedTransaction;
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException(id);
        }
    }
}