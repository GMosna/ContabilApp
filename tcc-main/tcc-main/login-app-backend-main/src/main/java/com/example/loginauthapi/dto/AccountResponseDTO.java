package com.example.loginauthapi.dto;

import java.math.BigDecimal;

public record AccountResponseDTO(Long id,
                                 String name,
                                 String bank,
                                 BigDecimal balance)
{ }
