package com.example.loginauthapi.services;

import com.example.loginauthapi.domain.TransactionType;
import com.example.loginauthapi.repositories.TransactionTypeRepository;
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

@Service
public class TransactionTypeService {

    @Autowired
    private TransactionTypeRepository repository;

    public TransactionType newTransactionType(TransactionType transactionType){
        return repository.save(transactionType);
    }

    public List<TransactionType> findAll(){
        List<TransactionType> transactionTypes = repository.findAll();
        return transactionTypes;
    }

    public TransactionType findById(Long id){
        Optional<TransactionType> transactionType = repository.findById(id);
        return transactionType.orElseThrow(() -> new ResourceNotFoundException(id));
    }

    public void updateData(TransactionType transactionType, TransactionType obj){
        transactionType.setTransactionType(obj.getTransactionType());
    }

    @Transactional
    public TransactionType update(Long id, TransactionType obj){
        try {
            TransactionType transactionType = repository.getReferenceById(id);
            updateData(transactionType, obj);
            return repository.save(transactionType);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException(id);
        }
    }

    public void delete(Long id){
        try {
            repository.deleteById(id);
        } catch (EmptyResultDataAccessException e) {
            throw new ResourceNotFoundException(id);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(e.getMessage());
        }
    }
}
