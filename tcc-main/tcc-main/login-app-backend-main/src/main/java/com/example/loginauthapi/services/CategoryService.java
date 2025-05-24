package com.example.loginauthapi.services;

import com.example.loginauthapi.dto.CategoryDTO;
import com.example.loginauthapi.domain.Category;
import com.example.loginauthapi.repositories.CategoryRepository;
import com.example.loginauthapi.services.exceptions.DatabaseException;
import com.example.loginauthapi.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public Category newCategory(Category category){
        return categoryRepository.save(category);
    }

    public List<CategoryDTO> findAllDto(){
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(category -> new CategoryDTO(category))
                .collect(Collectors.toList());
    }

    public void delete(Long id){
        try {
            categoryRepository.deleteById(id);
        } catch (EmptyResultDataAccessException e){
            throw new ResourceNotFoundException(id);
        } catch(DataIntegrityViolationException e){
            throw new DatabaseException(e.getMessage());
        }
    }

    public Category findById(Long id){
        Optional<Category> category = categoryRepository.findById(id);
        return category.orElseThrow(() -> new ResourceNotFoundException(id));
    }

    public void updateData(Category category, Category obj){
        category.setCategoryName(obj.getCategoryName());
    }

    @Transactional
    public Category update(Long id, Category obj){
        try {
            Category category = categoryRepository.getReferenceById(id);
            updateData(category, obj);
            return categoryRepository.save(category);
        } catch (EntityNotFoundException e){
            throw new ResourceNotFoundException(id);
        }
    }
}
