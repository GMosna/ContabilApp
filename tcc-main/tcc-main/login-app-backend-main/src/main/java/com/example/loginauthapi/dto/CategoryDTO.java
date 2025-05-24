package com.example.loginauthapi.dto;

import com.example.loginauthapi.domain.Category;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

@Getter
@Setter
public class CategoryDTO {

    private Long id;
    private String categoryName;

    public CategoryDTO(){
    }

    public CategoryDTO(Category entity){
        BeanUtils.copyProperties(entity, this);
    }
}
