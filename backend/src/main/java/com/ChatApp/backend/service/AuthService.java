package com.ChatApp.backend.service;

import com.ChatApp.backend.model.User;
import com.ChatApp.backend.repository.UserRepository;
import com.ChatApp.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder encoder;

    public String signup(User user){
        user.setPassword(encoder.encode(user.getPassword()));
        userRepository.save(user);
        return jwtService.generateToken(user.getUsername());
    }

    public String login(String username, String password){
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(encoder.matches(password, user.getPassword())){
            return jwtService.generateToken(user.getUsername());
        }
        throw new RuntimeException("Invalid password");
    }
}