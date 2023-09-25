package hcclab.eyeveProject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import hcclab.eyeveProject.domain.ChatMessage;
import org.kurento.client.KurentoClient;
import org.kurento.client.MediaPipeline;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.w3c.dom.Text;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


public class WebRTCSignalingService {
    @Autowired
    private KurentoClient kurentoClient;
    MediaPipeline pipeline = kurentoClient.createMediaPipeline();

    private ObjectMapper objectMapper = new ObjectMapper();
    WebRtcEndpoint webRtcEndpoint = new WebRtcEndpoint.Builder(pipeline).build();

    public void processSdpOffer(WebSocketSession session, ChatMessage message) throws IOException {
        String sdpOffer = message.getSdpOffer();
        String sdpAnswer = webRtcEndpoint.processOffer(sdpOffer);
        String jsonSdpAnswer = makeSdpAnswerMessage(sdpAnswer);
        session.sendMessage(new TextMessage(jsonSdpAnswer));
    }

    public String makeSdpAnswerMessage(String sdpAnswer) throws JsonProcessingException {
        Map<String, String> json = new HashMap<>();
        json.put("messageType", "SDP_ANSWER");
        json.put("SDP_ANSWER", sdpAnswer);
        return objectMapper.writeValueAsString(json);
    }


}
