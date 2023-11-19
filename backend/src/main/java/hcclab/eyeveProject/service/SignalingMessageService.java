package hcclab.eyeveProject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcclab.eyeveProject.domain.ChatMessage;
import hcclab.eyeveProject.domain.IceCandidatePayload;
import hcclab.eyeveProject.domain.UserSession;
import hcclab.eyeveProject.entity.Rooms;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.IceCandidate;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
@Slf4j
@Service
public class SignalingMessageService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /*
    새로 들어온 사람에게 방에 있는 유저들의 id를 반환하는 메세지를 생성하는 메서드
    - messageType : USERS_IN_ROOM
    - 해당 방에 있는 사람들의 id 반환
     */
    public String makeUserInRoomMessage(Rooms room) throws JsonProcessingException {
        Map<String, Object> json = new HashMap<>();
        json.put("messageType","USERS_IN_ROOM");
        json.put("users",room.getUserInRoomList().keySet());
        log.info("USERS_IN_ROOM {}",room.getUserInRoomList().keySet());
        return objectMapper.writeValueAsString(json);
    }


    /*
    방에 있는 기존 사람들에게 새로 들어온 사람의 Id 반환하는 메세지 생성
    - messageType : USER_ENTER
     */
    public String makeUserEnterMessage(String enteredUserId) throws JsonProcessingException {
        Map<String, Object> json = new HashMap<>();
        json.put("messageType","USER_ENTER");
        json.put("userId",enteredUserId);
        return objectMapper.writeValueAsString(json);
    }

    /*
    유저가 방에 나갔을때 다른 사람들에게 보낼 메세지 만들기
     */
    public String makeUserLeaveMessage(String leftUserId) throws JsonProcessingException {
        Map<String, Object> json = new HashMap<>();
        json.put("messageType", "LEAVE");
        json.put("userId", leftUserId);
        return objectMapper.writeValueAsString(json);
    }

    /*
    SdpAnswer 생성 메서드
    - 정보를 바탕으로 Sdp Answer 생성 후 반환
    - 혹시 몰라 front를 위해 sender도 추가
     */
    public String makeSdpAnswerMessage(String sdpAnswer, String sender) throws JsonProcessingException {
        Map<String, String> json = new HashMap<>();
        json.put("userId", sender);
        json.put("SDP_ANSWER", sdpAnswer);
        json.put("messageType", "SDP_ANSWER");

        return objectMapper.writeValueAsString(json);
    }

    /*
    Receiver Sdp Answer 생성을 위해 오버로딩
     */
    public String makeSdpAnswerMessage(String sdpAnswer, String sender, String receiver) throws JsonProcessingException {
        Map<String, String> json = new HashMap<>();
        //receiver의 요청인 경우 메세지 타입 RECEIVER_SDP_ANSWER
        json.put("messageType", "RECEIVER_SDP_ANSWER");
        json.put("userId", sender);
        //ReceiverId도 추가
        json.put("receiverId", receiver);
        json.put("SDP_ANSWER", sdpAnswer);

        return objectMapper.writeValueAsString(json);
    }

    /*
    Ice candidate 메세지 생성 메서드
    - 정보를 바탕으로 Ice candidate 메세지 생성 후 반환
     */
    public String makeIceCandidateMessage(IceCandidate iceCandidate, ChatMessage chatMessage) throws JsonProcessingException {
        Map<String, Object> json = new HashMap<>();
        json.put("messageType", "ICE_CANDIDATE");
        json.put("userId", chatMessage.getUserId());
        json.put("receiverId", chatMessage.getReceiverId());
        log.info("makeIceCandidateMessage : userId {}, receiver Id {}", chatMessage.getUserId(), chatMessage.getReceiverId());
        IceCandidatePayload iceCandidatePayload =
                new IceCandidatePayload(iceCandidate.getCandidate(), iceCandidate.getSdpMid(), iceCandidate.getSdpMLineIndex());
        json.put("candidate", iceCandidatePayload);

        return objectMapper.writeValueAsString(json);
    }



    /*
    요청 세션에게 messageType 재전송
    - front 처리를 위해 요청 세션에게 messageType을 재전송
    - 방 생성(CREATE)시, roomName도 함께 넣어서 전송
     */
    public synchronized void sendMessageType(WebSocketSession session, String messageType, String roomName){
        Map<String, String> message = new HashMap<>();
        message.put("messageType", messageType);
        try {
            if(messageType.equals("CREATE") || messageType.equals("JOIN")) {message.put("roomName", roomName);}
            String jsonMessage = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(jsonMessage));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /*
    메세지 전송 메서드
    - 메세지를 보낼 시, 자신(session)을 제외한 방에 있는 참가자들에게 메세지 전송
     */
    public synchronized void sendMessageExceptSelf(String message, WebSocketSession session, Rooms room) {
        room.getUserInRoomList().values().parallelStream()
                .map(UserSession::getWebSocketSession)
                .filter(s -> s != session)
                .forEach(s -> {
                    try {
                        s.sendMessage(new TextMessage(message));
                        log.info("방 메세지 전달 - 인원 수 : " + room.getUserInRoomList().size());
                        log.info("방 메세지 전달 - 내용 : " + message + ", 보낸 이 : " + session.getId());
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
    }

}
