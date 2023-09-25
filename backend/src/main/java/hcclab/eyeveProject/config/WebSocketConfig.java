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
    // Kurento Media Server 를 사용하기 위한 Bean 설정
    // Bean 으로 등록 후 반드시!! VM 옵션에서 kurento 관련 설정을 해주어야한다.
    // 아니면 에러남
    @Bean
    public KurentoClient kurentoClient() {
        return KurentoClient.create();
    }
}
