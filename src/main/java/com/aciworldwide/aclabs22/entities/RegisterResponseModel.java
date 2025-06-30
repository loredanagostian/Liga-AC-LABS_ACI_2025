package com.aciworldwide.aclabs22.entities;

import lombok.Getter;

@Getter
public class RegisterResponseModel {
    private final String message;
    private String token;
    private String id;
    private String userRole;

    public RegisterResponseModel(String message) {
        this.message = message;
    }

    public RegisterResponseModel(String message, String token, String id, String userRole) {
        this.message = message;
        this.token = token;
        this.id = id;
        this.userRole = userRole;
    }
}
