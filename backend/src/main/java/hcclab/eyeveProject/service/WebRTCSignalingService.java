package hcclab.eyeveProject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import hcclab.eyeveProject.domain.ChatMessage;
import hcclab.eyeveProject.domain.ChatRoomMap;
import hcclab.eyeveProject.domain.IceCandidatePayload;
import hcclab.eyeveProject.domain.UserSession;
import hcclab.eyeveProject.entity.Rooms;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.kurento.client.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.w3c.dom.Text;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


@Service
public class WebRTCSignalingService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ChatRoomMap chatRoomMap = ChatRoomMap.getInstance();
    private final Map<String, Rooms> RoomList = chatRoomMap.getRoomList();


    public void processSdpOffer(UserSession userSession, ChatMessage message) throws IOException {
        WebRtcEndpoint webRtcEndpoint = userSession.getWebRtcEndpoint();

        String sdpOffer = message.getSdpOffer();
        String sdpAnswer = webRtcEndpoint.processOffer(sdpOffer);
        String jsonSdpAnswer = makeSdpAnswerMessage(sdpAnswer);
        userSession.getWebSocketSession().sendMessage(new TextMessage(jsonSdpAnswer));
    }


    public String makeSdpAnswerMessage(String sdpAnswer) throws JsonProcessingException {
        Map<String, String> json = new HashMap<>();
        json.put("messageType", "SDP_ANSWER");
        json.put("SDP_ANSWER", sdpAnswer);
        return objectMapper.writeValueAsString(json);
    }


}
