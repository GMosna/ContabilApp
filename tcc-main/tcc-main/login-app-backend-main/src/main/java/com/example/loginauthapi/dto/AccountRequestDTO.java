package com.example.loginauthapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AccountRequestDTO(
                                @NotBlank String name,
                                @NotBlank String cpf,
                                @NotNull LocalDate dateOfBirth,
                                @NotBlank String bank,
                                BigDecimal balance
) {
}
