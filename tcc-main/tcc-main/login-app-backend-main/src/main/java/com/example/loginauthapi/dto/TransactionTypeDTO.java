package com.example.loginauthapi.dto;

import com.example.loginauthapi.domain.TransactionType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionTypeDTO {

    private Long id;
    private String transactionType;

    public TransactionTypeDTO(){
    }

    public TransactionTypeDTO(TransactionType transactionType) {
        this.id = transactionType.getId();
        this.transactionType = transactionType.getTransactionType();
    }
}
