package hcclab.eyeveProject.config;

import hcclab.eyeveProject.handler.SignalHandler;
import lombok.RequiredArgsConstructor;
import org.kurento.client.KurentoClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {
    private final SignalHandler signalHandler;

    /*
    signalHandler 등록 메서드
    - 해당 주소로 요청이 오면, signalHandler가 작동하여 WebSocket 작동
     */
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(signalHandler, "/socket")
                .setAllowedOrigins("*");
    }

}
