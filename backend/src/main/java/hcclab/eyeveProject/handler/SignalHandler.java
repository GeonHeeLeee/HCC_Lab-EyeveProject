package hcclab.eyeveProject.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import hcclab.eyeveProject.domain.ChatMessage;
import hcclab.eyeveProject.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
@Slf4j
@RequiredArgsConstructor
public class SignalHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;

    private final ChatRoomService chatRoomService;
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.info("Message : " + payload);

        ChatMessage chatMessage = objectMapper.readValue(payload, ChatMessage.class);
        chatRoomService.handlerActions(session, chatMessage);
    }
}
