package com.ChatApp.backend.service;

import com.ChatApp.backend.model.Message;
import com.ChatApp.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final MessageRepository messageRepository;
    public Message sendMessage(String senderId,String receiverId,String content){
        Message msg = Message.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .timestamp(LocalDateTime.now())
                .seen(false)
                .build();
        return messageRepository.save(msg);
    }
    public List<Message> getMessages(String user1, String user2){
        return messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(user1,user2,user1,user2);
    }
}
