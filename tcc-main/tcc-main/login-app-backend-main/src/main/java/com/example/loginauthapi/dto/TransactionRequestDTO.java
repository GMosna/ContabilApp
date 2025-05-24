package com.example.loginauthapi.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TransactionRequestDTO {
    private String description;
    private BigDecimal amount;
    private LocalDateTime date;
    private Long categoryId; // ID da categoria
    private Long transactionTypeId; // ID do tipo de transação
    private Long userId; // ID do usuário
}

