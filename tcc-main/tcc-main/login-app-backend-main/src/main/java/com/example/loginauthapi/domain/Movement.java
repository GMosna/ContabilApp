package com.example.loginauthapi.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_movements")
@Getter
@Setter
public class Movement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long accountId;

    private String type; // "DEPOSIT" ou "WITHDRAW"

    private BigDecimal amount;

    private LocalDateTime movementDate;

    public Movement(){}

    public Movement(Long accountId, String type, BigDecimal amount, LocalDateTime movementDate) {
        this.accountId = accountId;
        this.type = type;
        this.amount = amount;
        this.movementDate = movementDate;
    }
}
