package hcclab.eyeveProject.domain;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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
