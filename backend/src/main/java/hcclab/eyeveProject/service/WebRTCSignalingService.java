package hcclab.eyeveProject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import hcclab.eyeveProject.domain.ChatMessage;
import hcclab.eyeveProject.domain.IceCandidatePayload;
import org.kurento.client.*;
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
    private final ObjectMapper objectMapper = new ObjectMapper();


    public void processSdpOffer(WebSocketSession session, ChatMessage message) throws IOException {
        MediaPipeline pipeline = kurentoClient.createMediaPipeline();
        WebRtcEndpoint webRtcEndpoint = new WebRtcEndpoint.Builder(pipeline).build();

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
