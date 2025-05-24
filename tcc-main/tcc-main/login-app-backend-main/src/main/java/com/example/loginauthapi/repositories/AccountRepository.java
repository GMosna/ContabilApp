package com.example.loginauthapi.repositories;

import com.example.loginauthapi.domain.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Long> {
}
