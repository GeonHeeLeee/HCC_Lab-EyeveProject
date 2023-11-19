package hcclab.eyeveProject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcclab.eyeveProject.domain.ChatMessage;
import hcclab.eyeveProject.domain.ChatRoomMap;
import hcclab.eyeveProject.domain.IceCandidatePayload;
import hcclab.eyeveProject.domain.UserSession;
import hcclab.eyeveProject.entity.Rooms;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.*;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


@Service
@Slf4j
@RequiredArgsConstructor
public class WebRTCSignalingService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ChatRoomMap chatRoomMap = ChatRoomMap.getInstance();
    private final SignalingMessageService signalingMessageService;
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
        String sdpAnswer = webRtcEndpoint.processOffer(sdpOffer);
        String jsonSdpAnswer = signalingMessageService.makeSdpAnswerMessage(sdpAnswer, sender);


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
        log.info("processReceiverSdpOffer : rtcep - {}",receiverEndpoint);
        String sdpAnswer = receiverEndpoint.processOffer(sdpOffer);
        //Receiver Sdp Answer 메세지 생성
        String jsonSdpAnswer = signalingMessageService.makeSdpAnswerMessage(sdpAnswer, senderId, receiverId);

        receiverEndpoint.gatherCandidates();
        senderSession.getWebSocketSession().sendMessage(new TextMessage(jsonSdpAnswer));
    }

    /*
    사용자로부터 받은 iceCandidate 메세지 처리
    - 해당 WebRtcEndpoint에 iceCandidate 등록
     */
    public void processIceCandidate(WebRtcEndpoint webRtcEndpoint,WebRtcEndpoint receiverWebRtcEndpoint, ChatMessage message) {
        IceCandidatePayload payload = message.getIceCandidate();
        IceCandidate iceCandidate =
                new IceCandidate(payload.getCandidate(), payload.getSdpMid(), payload.getSdpMLineIndex());
        log.info("processIceCandidate 함수 호출");
        //사용자 본인을 등록하는 경우
        if(receiverWebRtcEndpoint == null) {
            webRtcEndpoint.addIceCandidate(iceCandidate);
        }
        //새로 들어오거나 기존에 있던 사람이 방에 있는 다른 사람을 등록하는 경우
        else{
            receiverWebRtcEndpoint.addIceCandidate(iceCandidate);
        }
    }

    /*
    WebRTCEndpoint 생성 메서드
    - 생성 후, 해당 userSession에 WebRTCEndpoint로 등록
     */
    public void createWebRTCEp(Rooms roomJoined, UserSession userSession, ChatMessage chatMessage) {
        WebRtcEndpoint webRtcEndpoint = new WebRtcEndpoint.Builder(roomJoined.getPipeline()).build();
        addIceEventListener(webRtcEndpoint, userSession, chatMessage);
        userSession.setWebRtcEndpoint(webRtcEndpoint);
        log.info(String.format("%s의 webRTCEp 생성", userSession.getUser().getUserId()));
    }


    /*
    DownStream Endpoint 생성 메서드
    - 방에 있던 기존 사람이나 새로 들어온 사람이 다른 사람들의 Endpoint(downStream) 생성
     */
    public void createDownStreamEndpoint(Rooms roomJoined, UserSession receiverSession, ChatMessage chatMessage, UserSession senderSession) {
        WebRtcEndpoint receiverDownStream = new WebRtcEndpoint.Builder(roomJoined.getPipeline()).build();
        String receiverId = receiverSession.getUser().getUserId();

        log.info("createDownStreamEndpoint 실행");
        addIceEventListener(receiverDownStream, senderSession, chatMessage);
        //DownStream에 추가
        senderSession.getDownStreams().put(receiverId, receiverDownStream);
        log.info("createDownStreamEP - sender{}의 downstream : {}",senderSession.getUser().getUserId(),senderSession.getDownStreams().keySet());
        //sender에 receiver 연결
        senderSession.getWebRtcEndpoint().connect(receiverDownStream);
        receiverSession.getWebRtcEndpoint().connect(receiverDownStream);
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
                String jsonMessage = signalingMessageService.makeIceCandidateMessage(iceCandidate, chatMessage);
                synchronized (userSession.getWebSocketSession()) {
                    userSession.getWebSocketSession().sendMessage(new TextMessage(jsonMessage));
                    log.info("sender:{}, receiver:{}의 IceCandidate 전송 성공",chatMessage.getUserId(), chatMessage.getReceiverId());
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }
}



