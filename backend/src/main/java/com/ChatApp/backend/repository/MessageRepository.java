package com.ChatApp.backend.repository;

import com.ChatApp.backend.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message,String> {
    List<Message> findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
            String senderId, String receiverId, String receiverId2, String senderId2);
}