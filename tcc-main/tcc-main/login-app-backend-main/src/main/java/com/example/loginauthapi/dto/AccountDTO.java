package com.example.loginauthapi.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AccountDTO(String name,
                         String cpf,
                         LocalDate dateOfBirth,
                         String bank,
                         BigDecimal balance) {
}
