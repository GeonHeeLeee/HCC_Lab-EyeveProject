package hcclab.eyeveProject.domain;

import hcclab.eyeveProject.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.web.socket.WebSocketSession;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Getter @Setter
public class UserSession {
    private User user;
    private WebSocketSession webSocketSession;
    private WebRtcEndpoint webRtcEndpoint;
    private HashMap<String, WebRtcEndpoint> downStreams;

    public UserSession(User user, WebSocketSession session, WebRtcEndpoint webRtcEndpoint) {
        this.user = user;
        this.webSocketSession = session;
        this.webRtcEndpoint = webRtcEndpoint;
        this.downStreams = new HashMap<>();
    }

}
