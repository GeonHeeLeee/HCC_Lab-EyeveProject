package hcclab.eyeveProject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcclab.eyeveProject.domain.ChatMessage;
import hcclab.eyeveProject.domain.ChatRoomMap;
import hcclab.eyeveProject.domain.IceCandidatePayload;
import hcclab.eyeveProject.domain.UserSession;
import hcclab.eyeveProject.entity.Rooms;
import org.kurento.client.*;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


@Service
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

        /*
        addIceCandidateListener
        - 새로운 참가자가 방에 참여하면서 ICE 후보자 정보를 KMS에 전송
        - Ice 후보자가 발견 되었을 때, 참가자에게 전송
         */
        webRtcEndpoint.addIceCandidateFoundListener(event -> {
            try {
                IceCandidate iceCandidate = event.getCandidate();
                String jsonMessage = makeIceCandidateMessage(iceCandidate);
                userSession.getWebSocketSession().sendMessage(new TextMessage(jsonMessage));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
        String sdpOffer = message.getSdpOffer();
        String sender = message.getUserId();

        webRtcEndpoint.gatherCandidates(); //ice 후보자 수집 - 이 부분이 잘 이해가 가지 않음

        //sdp answer 생성 후 다시 클라이언트에게 보내기
        String sdpAnswer = webRtcEndpoint.processOffer(sdpOffer);
        String jsonSdpAnswer = makeSdpAnswerMessage(sdpAnswer, sender);
        userSession.getWebSocketSession().sendMessage(new TextMessage(jsonSdpAnswer));
    }


    /*
    SdpAnswer 생성 메서드
    - 정보를 바탕으로 Sdp Answer 생성 후 반환
    - 혹시 몰라 front를 위해 sender도 추가
     */
    public String makeSdpAnswerMessage(String sdpAnswer,String sender) throws JsonProcessingException {
        Map<String, String> json = new HashMap<>();
        json.put("messageType", "SDP_ANSWER");
        json.put("userId", sender);
        json.put("SDP_ANSWER", sdpAnswer);
        return objectMapper.writeValueAsString(json);
    }

    /*
    Ice candidate 메세지 생성 메서드
    - 정보를 바탕으로 Ice candidate 메세지 생성 후 반환
     */
    private String makeIceCandidateMessage(IceCandidate iceCandidate) throws JsonProcessingException {
        Map<String, Object> json = new HashMap<>();
        json.put("messageType", "ICE_CANDIDATE");
        json.put("candidate", iceCandidate.getCandidate());
        json.put("sdpMid", iceCandidate.getSdpMid());
        json.put("sdpMLineIndex", iceCandidate.getSdpMLineIndex());

        return objectMapper.writeValueAsString(json);
    }

    /*
    사용자로부터 받은 iceCandidate 메세지 처리
    - 해당 WebRtcEndpoint에 iceCandidate 등록
    - 현재 iceCandidatePayload 사용중인데, 만약 front에서 호환이 안될 시 그냥 chatMessage에 새로 추가하는게 나을듯
     */
    public void processIceCandidate(UserSession userSession, ChatMessage message) {
        IceCandidatePayload payload = message.getIceCandidate();
        IceCandidate iceCandidate =
                new IceCandidate(payload.getCandidate(), payload.getSdpMid(), payload.getSdpMLineIndex());

        userSession.getWebRtcEndpoint().addIceCandidate(iceCandidate);
    }

    public void createWebRTCEp(Rooms roomJoined, UserSession userSession) {
        WebRtcEndpoint webRtcEndpoint = new WebRtcEndpoint.Builder(roomJoined.getPipeline()).build();
        userSession.setWebRtcEndpoint(webRtcEndpoint);
    }

    public void connectWebRTCEp(Rooms roomJoined, UserSession userSession) {
        for(UserSession otherUserSession : roomJoined.getUserInRoomList().values()){
            if(otherUserSession != userSession) {
                otherUserSession.getWebRtcEndpoint().connect(userSession.getWebRtcEndpoint());
                userSession.getWebRtcEndpoint().connect(otherUserSession.getWebRtcEndpoint());
            }
        }
    }

}
