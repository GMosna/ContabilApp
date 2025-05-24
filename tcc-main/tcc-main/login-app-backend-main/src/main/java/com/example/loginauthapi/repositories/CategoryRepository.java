package com.example.loginauthapi.repositories;

import com.example.loginauthapi.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
