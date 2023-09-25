package hcclab.eyeveProject.domain;

import hcclab.eyeveProject.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.web.socket.WebSocketSession;

@AllArgsConstructor
@Getter @Setter
public class UserSession {
    private User user;
    private WebSocketSession webSocketSession;
    private WebRtcEndpoint webRtcEndpoint;

    //이렇게 하는 것도 좋을듯
}
