package com.example.loginauthapi.dto;

import com.example.loginauthapi.domain.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {

    private Long id;
    private String name;
    private String email;

    public UserDTO(){
    }

    public UserDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
    }
}
