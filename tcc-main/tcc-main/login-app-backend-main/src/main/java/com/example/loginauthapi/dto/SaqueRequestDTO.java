package com.example.loginauthapi.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record SaqueRequestDTO(
        @NotNull(message = "Valor do saque é obrigatório.")
        @Positive(message = "Valor do saque deve ser positivo.")
        BigDecimal value
) {
}

