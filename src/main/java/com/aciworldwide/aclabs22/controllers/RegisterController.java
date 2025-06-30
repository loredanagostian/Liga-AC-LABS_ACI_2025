package com.aciworldwide.aclabs22.controllers;

import com.aciworldwide.aclabs22.dto.UserRegisterDTO;
import com.aciworldwide.aclabs22.entities.UserModel;
import com.aciworldwide.aclabs22.services.UserService;
import com.aciworldwide.aclabs22.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(value = "/register")
public class RegisterController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    private static final Logger logger = LogManager.getLogger();

    @PostMapping(path = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerUser(@RequestBody() UserRegisterDTO userRegisterDTO) {
        logger.info("Attempting to register user: {}", userRegisterDTO.getName());

        if (userService.usernameAlreadyExists(userRegisterDTO.getName())) {
            return ResponseEntity.status(409).body("Username already taken. Please choose a different one.");
        }

        if (userRegisterDTO.getPassword() == null || userRegisterDTO.getPassword().isEmpty() ||
                userRegisterDTO.getConfirmPassword() == null || userRegisterDTO.getConfirmPassword().isEmpty()) {
            return ResponseEntity.status(400).body("Passwords cannot be empty.");
        }

        if (!userRegisterDTO.getPassword().equals(userRegisterDTO.getConfirmPassword())) {
            return ResponseEntity.status(400).body("Passwords do not match.");
        }

        if (!isPasswordValid(userRegisterDTO.getPassword())) {
            return ResponseEntity.status(400).body("Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.");
        }

        UserModel userModel = userService.registerUser(userRegisterDTO);

        String token = jwtUtil.generateToken(userModel.getName());

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("token", token);
        responseBody.put("id", userModel.getId());

        return ResponseEntity.ok(responseBody);
    }

    private boolean isPasswordValid(String password) {
        String passwordPattern = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$";
        return password.matches(passwordPattern);
    }
}
