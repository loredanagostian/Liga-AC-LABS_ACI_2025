package com.aciworldwide.aclabs22.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class UserRegisterDTO {
    private String name;
    private String password;
    private String confirmPassword;
    private String userRole;
}
