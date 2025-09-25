package com.ChatApp.backend.controller;

import com.ChatApp.backend.model.User;
import com.ChatApp.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public String signup(@RequestBody User user){
        return authService.signup(user);
    }
    @PostMapping("/login")
    public String login(@RequestBody User user){
        return authService.login(user.getUsername(), user.getPassword());
    }
}
