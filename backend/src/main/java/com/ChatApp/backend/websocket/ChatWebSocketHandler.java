package com.ChatApp.backend.websocket;

import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

public class ChatWebSocketHandler extends TextWebSocketHandler {

    // Store active sessions mapped by username
    private static final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // Extract username from query params
        String username = getUsername(session);
        if (username != null) {
            sessions.put(username, session);
            System.out.println(username + " connected.");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String username = getUsername(session);
        if (username != null) {
            sessions.remove(username);
            System.out.println(username + " disconnected.");
        }
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Expect JSON like: { "from": "john", "to": "alex", "content": "hello" }
        Map<String, String> payload = mapper.readValue(message.getPayload(), Map.class);

        String toUser = payload.get("to");
        WebSocketSession receiverSession = sessions.get(toUser);

        if (receiverSession != null && receiverSession.isOpen()) {
            receiverSession.sendMessage(new TextMessage(message.getPayload()));
        }

        // (optional) also send back to sender for confirmation
        session.sendMessage(new TextMessage(message.getPayload()));
    }

    private String getUsername(WebSocketSession session) {
        // Example: ws://localhost:8080/ws/chat?username=john
        return session.getUri().getQuery().split("=")[1];
    }
}


