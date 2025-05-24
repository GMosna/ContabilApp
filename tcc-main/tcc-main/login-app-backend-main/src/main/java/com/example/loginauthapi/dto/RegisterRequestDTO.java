package com.example.loginauthapi.dto;

import java.time.LocalDate;

public record RegisterRequestDTO (String name, LocalDate dateOfBirth, String cpf, String email, String password) {
}
