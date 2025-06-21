package com.example.loginauthapi.controllers;

import com.example.loginauthapi.domain.User;
import com.example.loginauthapi.dto.LoginRequestDTO;
import com.example.loginauthapi.dto.RegisterRequestDTO;
import com.example.loginauthapi.dto.ResponseDTO;
import com.example.loginauthapi.infra.security.TokenService;
import com.example.loginauthapi.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody LoginRequestDTO body){
        User user = this.repository.findByEmail(body.email()).orElseThrow(() -> new RuntimeException("User not found"));
        if(passwordEncoder.matches(body.password(), user.getPassword())) {
            String token = this.tokenService.generateToken(user);
            return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail()
                )
            ));
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody RegisterRequestDTO body){
        try {
            Optional<User> user = this.repository.findByEmail(body.email());

            if(user.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email já cadastrado"));
            }

            User newUser = new User();
            newUser.setPassword(passwordEncoder.encode(body.password()));
            newUser.setEmail(body.email());
            newUser.setName(body.name());
            newUser.setCpf(body.cpf());
            newUser.setDateOfBirth(body.dateOfBirth());
            
            try {
                this.repository.save(newUser);
                String token = this.tokenService.generateToken(newUser);
                return ResponseEntity.ok(new ResponseDTO(newUser.getName(), token));
            } catch (DataIntegrityViolationException e) {
                if (e.getMessage().contains("CPF")) {
                    return ResponseEntity.badRequest().body(Map.of("message", "CPF já cadastrado"));
                } else if (e.getMessage().contains("email")) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Email já cadastrado"));
                } else if (e.getMessage().contains("name")) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Nome de usuário já cadastrado"));
                }
                return ResponseEntity.badRequest().body(Map.of("message", "Dados inválidos ou já cadastrados"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Erro ao realizar cadastro: " + e.getMessage()));
        }
    }
}
