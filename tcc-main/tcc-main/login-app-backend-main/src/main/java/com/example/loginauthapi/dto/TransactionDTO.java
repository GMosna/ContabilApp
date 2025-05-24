package com.example.loginauthapi.dto;

import com.example.loginauthapi.domain.Transaction;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class TransactionDTO {

    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDateTime date;
    private CategoryDTO category;
    private TransactionTypeDTO transactionType;
    private UserDTO user;

    public TransactionDTO() {
    }

    public TransactionDTO(Transaction transaction) {
        this.id = transaction.getId();
        this.description = transaction.getDescription();
        this.amount = transaction.getAmount();
        this.date = transaction.getDate();
        this.category = new CategoryDTO(transaction.getCategory());
        this.transactionType = new TransactionTypeDTO(transaction.getTransactionType());
        this.user = new UserDTO(transaction.getUser());
    }
}
