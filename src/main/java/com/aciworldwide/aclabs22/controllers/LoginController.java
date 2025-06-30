package com.aciworldwide.aclabs22.controllers;

import com.aciworldwide.aclabs22.entities.UserModel;
import com.aciworldwide.aclabs22.services.UserService;
import com.aciworldwide.aclabs22.utils.JwtUtil;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(value = "/login")
public class LoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    private static final Logger logger = LogManager.getLogger();

    @PostMapping(path = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> loginUser(@RequestBody UserModel userModel) {
        logger.info("Processing login: {} with pwd {}", userModel.getName(), userModel.getPassword());

        UserModel user = userService.loginUser(userModel);

        if (user == null) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getName());

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("token", token);
        responseBody.put("id", user.getId());
        responseBody.put("userRole", user.getUserRole());

        return ResponseEntity.ok(responseBody);
    }
}