package com.example.loginauthapi.services;

import com.example.loginauthapi.dto.TransactionDTO;
import com.example.loginauthapi.dto.TransactionRequestDTO;
import com.example.loginauthapi.domain.Category;
import com.example.loginauthapi.domain.Transaction;
import com.example.loginauthapi.domain.TransactionType;
import com.example.loginauthapi.domain.User;
import com.example.loginauthapi.repositories.CategoryRepository;
import com.example.loginauthapi.repositories.TransactionRepository;
import com.example.loginauthapi.repositories.TransactionTypeRepository;
import com.example.loginauthapi.repositories.UserRepository;
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

        // Criar a nova transação
        Transaction transaction = new Transaction();
        transaction.setDescription(dto.getDescription());
        transaction.setAmount(dto.getAmount());
        transaction.setDate(dto.getDate());
        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setTransactionType(transactionType);

        // Salvar e retornar a transação
        return transactionRepository.save(transaction);
    }


    public List<TransactionDTO> findAllDto(){
        List<Transaction> transactions = transactionRepository.findAll();
        return transactions.stream()
                .map(transaction -> new TransactionDTO(transaction))
                .collect(Collectors.toList());
    }

    public void delete(Long id){
        try {
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
            Transaction transaction = transactionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

            // Buscar o User pelo ID fornecido no DTO
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));

            // Buscar a Category pelo ID fornecido no DTO
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

            // Buscar o TransactionType pelo ID fornecido no DTO
            TransactionType transactionType = transactionTypeRepository.findById(dto.getTransactionTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("TransactionType not found with id: " + dto.getTransactionTypeId()));

            // Atualizar os dados da transação
            transaction.setDescription(dto.getDescription());
            transaction.setAmount(dto.getAmount());
            transaction.setDate(dto.getDate());
            transaction.setTransactionType(transactionType);
            transaction.setUser(user);
            transaction.setCategory(category);

            // Salvar e retornar a transação atualizada
            return transactionRepository.save(transaction);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException(id);
        }
    }
}