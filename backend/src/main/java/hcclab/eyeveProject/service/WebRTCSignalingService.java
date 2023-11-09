package hcclab.eyeveProject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcclab.eyeveProject.domain.ChatMessage;
import hcclab.eyeveProject.domain.ChatRoomMap;
import hcclab.eyeveProject.domain.IceCandidatePayload;
import hcclab.eyeveProject.domain.UserSession;
import hcclab.eyeveProject.entity.Rooms;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.*;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


@Service
@Slf4j
public class WebRTCSignalingService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ChatRoomMap chatRoomMap = ChatRoomMap.getInstance();
    private final Map<String, Rooms> RoomList = chatRoomMap.getRoomList();


    /*
    SdpOffer 처리 메서드
    - sdpOffer를 처리하여 KMS에 보내고 sdpAnswer를 생성하여 사용자 session에 보냄
    - To Do : iceCandidateListener 등록
     */
    public void processSdpOffer(UserSession userSession, ChatMessage message) throws IOException {
        WebRtcEndpoint webRtcEndpoint = userSession.getWebRtcEndpoint();

        log.info("processSdpOffer webSession : " + userSession.getWebSocketSession());
        log.info("processSdpOffer rtcSession : " + webRtcEndpoint);

        String sdpOffer = message.getSdpOffer();
        String sender = message.getUserId();
        //sdp answer 생성 후 다시 클라이언트에게 보내기
        log.info("processOffer 전");
        String sdpAnswer = webRtcEndpoint.processOffer(sdpOffer);
        log.info("processOffer 후");
        String jsonSdpAnswer = makeSdpAnswerMessage(sdpAnswer, sender);
        webRtcEndpoint.gatherCandidates(); //ice 후보자 수집 - 이 부분이 잘 이해가 가지 않음


        log.info("sending SDP_ANSWER");
        userSession.getWebSocketSession().sendMessage(new TextMessage(jsonSdpAnswer));
    }

    /*
    receiver의 sdpOffer 처리하는 메서드
     */
    public void processReceiverSdpOffer(UserSession senderSession, WebRtcEndpoint receiverEndpoint, ChatMessage message) throws IOException {
        String sdpOffer = message.getSdpOffer();
        String senderId = message.getUserId();
        String receiverId = message.getReceiverId();

        log.info("Sender({}) - Receiver({}) process Offer",senderId,receiverId);
        String sdpAnswer = receiverEndpoint.processOffer(sdpOffer);
        //Receiver Sdp Answer 메세지 생성
        String jsonSdpAnswer = makeSdpAnswerMessage(sdpAnswer, senderId, receiverId);

        receiverEndpoint.gatherCandidates();
        log.info("Receiver sending SDP_ANSWER");
        senderSession.getWebSocketSession().sendMessage(new TextMessage(jsonSdpAnswer));
    }


    /*
    SdpAnswer 생성 메서드
    - 정보를 바탕으로 Sdp Answer 생성 후 반환
    - 혹시 몰라 front를 위해 sender도 추가
     */
    private String makeSdpAnswerMessage(String sdpAnswer, String sender) throws JsonProcessingException {
        Map<String, String> json = new HashMap<>();
        json.put("userId", sender);
        json.put("SDP_ANSWER", sdpAnswer);
        json.put("messageType", "SDP_ANSWER");

        return objectMapper.writeValueAsString(json);
    }

    /*
    Receiver Sdp Answer 생성을 위해 오버로딩
     */
    private String makeSdpAnswerMessage(String sdpAnswer, String sender, String receiver) throws JsonProcessingException {
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
    private String makeIceCandidateMessage(IceCandidate iceCandidate, ChatMessage chatMessage) throws JsonProcessingException {
        Map<String, Object> json = new HashMap<>();
        json.put("messageType", "ICE_CANDIDATE");
        json.put("userId", chatMessage.getUserId());
        json.put("receiverId", chatMessage.getReceiverId());
        log.info("makeIceCandidateMessage 실행");

        IceCandidatePayload iceCandidatePayload =
                new IceCandidatePayload(iceCandidate.getCandidate(), iceCandidate.getSdpMid(), iceCandidate.getSdpMLineIndex());
        json.put("candidate", iceCandidatePayload);

        return objectMapper.writeValueAsString(json);
    }



    /*
    사용자로부터 받은 iceCandidate 메세지 처리
    - 해당 WebRtcEndpoint에 iceCandidate 등록
     */
    public void processIceCandidate(WebRtcEndpoint webRtcEndpoint, ChatMessage message) {
        IceCandidatePayload payload = message.getIceCandidate();
        IceCandidate iceCandidate =
                new IceCandidate(payload.getCandidate(), payload.getSdpMid(), payload.getSdpMLineIndex());
        log.info("processIceCandidate 함수 호출");
        webRtcEndpoint.addIceCandidate(iceCandidate);
    }

    /*
    WebRTCEndpoint 생성 메서드
    - 생성 후, 해당 userSession에 WebRTCEndpoint로 등록
     */
    public void createWebRTCEp(Rooms roomJoined, UserSession userSession, ChatMessage chatMessage) {
        WebRtcEndpoint webRtcEndpoint = new WebRtcEndpoint.Builder(roomJoined.getPipeline()).build();
        addIceEventListener(webRtcEndpoint, userSession, chatMessage);
        userSession.setWebRtcEndpoint(webRtcEndpoint);
        log.info("createRTCEP - set : " + webRtcEndpoint);
        log.info(String.format("%s의 webRTCEp 생성", userSession.getUser().getUserId()));
    }

    /*
    방에 있는 사람들과 WebRTCEndpoint 연결
    - 자신을 제외한 방에 있는 사람들과 WebRTCEndpoint 연결하기
     */
//    public void connectWebRTCEp(Rooms roomJoined, UserSession userSession) {
//        for (UserSession otherUserSession : roomJoined.getUserInRoomList().values()) {
//            if (otherUserSession != userSession) {
//                otherUserSession.getWebRtcEndpoint().connect(userSession.getWebRtcEndpoint());
//                userSession.getWebRtcEndpoint().connect(otherUserSession.getWebRtcEndpoint());
//
//                log.info(String.format("%s와 %s 간 WebRTCEp 연결", otherUserSession.getUser().getUserId(),
//                        userSession.getUser().getUserId()));
//            }
//        }
//    }

    public void createDownStreamEndpoint(Rooms roomJoined, UserSession userSession, ChatMessage chatMessage) {
        WebRtcEndpoint downStreamEndpoint = new WebRtcEndpoint.Builder(roomJoined.getPipeline()).build();

        addIceEventListener(downStreamEndpoint, userSession, chatMessage);
        //downStream에 추가
        userSession.getDownStreams().put(chatMessage.getReceiverId(), downStreamEndpoint);
        //receiver와 sender endpoint 연결
        userSession.getWebRtcEndpoint().connect(downStreamEndpoint);
    }


    /*
    addIceCandidateListener
    - 새로운 참가자가 방에 참여하면서 ICE 후보자 정보를 KMS에 전송
    - Ice 후보자가 발견 되었을 때, 참가자에게 전송
     */
    public void addIceEventListener(WebRtcEndpoint webRtcEndpoint, UserSession userSession, ChatMessage chatMessage) {
        webRtcEndpoint.addIceCandidateFoundListener(event -> {
            try {
                IceCandidate iceCandidate = event.getCandidate();

                String jsonMessage = makeIceCandidateMessage(iceCandidate, chatMessage);
                synchronized (userSession.getWebSocketSession()) {
                    userSession.getWebSocketSession().sendMessage(new TextMessage(jsonMessage));
                    log.info("sendIceMessage(processSDP)");
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }
}



