package com.ChatApp.backend.controller;

import com.ChatApp.backend.model.Message;
import com.ChatApp.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    @PostMapping("/send")
    public Message sendMessage(@RequestParam String senderId,
                               @RequestParam String receiverId,
                               @RequestParam String content){
        return chatService.sendMessage(senderId,receiverId,content);
    }
    @GetMapping("/messages")
    public List<Message> getMessages(@RequestParam String user1, @RequestParam String user2){
        return chatService.getMessages(user1,user2);
    }
}
