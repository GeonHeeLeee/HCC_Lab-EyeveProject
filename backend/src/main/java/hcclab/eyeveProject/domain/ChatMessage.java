package hcclab.eyeveProject.domain;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcclab.eyeveProject.entity.Rooms;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@Slf4j
public class ChatMessage {
    public enum MessageType {
        CREATE, JOIN, CHAT, SDP_OFFER, LEAVE,ICE_CANDIDATE, RECEIVER_SDP_OFFER;
    }
    private String roomName; //방 이름 - UUID
    private String userId;
    private MessageType messageType;
    private String message;

    private String sdpOffer;

    private String receiverId;

    private IceCandidatePayload iceCandidate;

}
