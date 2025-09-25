package com.ChatApp.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document("users")
public class User {
    @Id
    private String id;
    private String username;
    private String password;
    private String profilePicUrl;
    private LocalDateTime lastSeen;
    private boolean online;
}
