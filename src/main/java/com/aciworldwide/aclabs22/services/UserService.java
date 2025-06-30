package com.aciworldwide.aclabs22.services;

import com.aciworldwide.aclabs22.dto.UserRegisterDTO;
import com.aciworldwide.aclabs22.entities.UserModel;
import com.aciworldwide.aclabs22.repositories.UserRepository;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.transaction.Transactional;
import java.util.Optional;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;

@Service
@Log4j2
public class UserService {

    @Autowired
    UserRepository userRepository;

    @Transactional
    public UserModel loginUser(UserModel loginRequest) {
        Optional<UserModel> userOptional = userRepository.findByName(loginRequest.getName());

        if (!userOptional.isPresent()) {
            log.warn("User not found: {}", loginRequest.getName());
            return null;
        }

        UserModel userModel = userOptional.get();

        Argon2 argon2 = Argon2Factory.create();

        if (!argon2.verify(userModel.getPassword(), loginRequest.getPassword().toCharArray())) {
            log.warn("Invalid password for user: {}", loginRequest.getName());
            return null;
        }

        log.info("User authenticated: {}", userModel.getName());
        return userModel;
    }

    @Transactional
    public boolean usernameAlreadyExists(String username) {
        return userRepository.existsByName(username);
    }

    @Transactional
    public UserModel registerUser(UserRegisterDTO userRegisterDTO) {
        log.info("Registering user: {}", userRegisterDTO);

        UserModel userModel = new UserModel();
        userModel.setName(userRegisterDTO.getName());
        userModel.setUserRole(userRegisterDTO.getUserRole());

        // Hash the password with Argon2
        String hashedPassword = hashPasswordWithArgon2(userRegisterDTO.getPassword());
        userModel.setPassword(hashedPassword);

        userRepository.save(userModel);

        return userModel;
    }

    private String hashPasswordWithArgon2(String password) {
        Argon2 argon2 = Argon2Factory.create();
        char[] passwordChars = password.toCharArray();

        // Hash the password with time cost=4, memory cost=65536, and parallelism=1
        return argon2.hash(4, 65536, 1, passwordChars);
    }
}
