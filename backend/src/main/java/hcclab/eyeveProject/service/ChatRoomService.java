package hcclab.eyeveProject.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import hcclab.eyeveProject.domain.ChatMessage;
import hcclab.eyeveProject.domain.ChatRoomMap;
import hcclab.eyeveProject.domain.UserSession;
import hcclab.eyeveProject.entity.Rooms;
import hcclab.eyeveProject.entity.User;
import hcclab.eyeveProject.repository.RoomRepository;
import hcclab.eyeveProject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.KurentoClient;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatRoomService {
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final KurentoClient kurentoClient;
    private final WebRTCSignalingService webRTCSignalingService;
    private final ChatRoomMap chatRoomMap = ChatRoomMap.getInstance();
    private final Map<String, Rooms> RoomList = chatRoomMap.getRoomList();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /*
    방 생성 메서드
    - 방을 생성하고, 연관 관계 지정 후, DB 저장
    - 방 생성자는 방에 자동으로 참가
    - 방 생성 시 마다 MediaPipeline 객체 생성
    - 반환 값으로 roomName(roomUUID를 반환)
     */
    @Transactional
    public String createRoom(String userId, WebSocketSession session) {
        User findUser = userRepository.findById(userId);
        Rooms createdRoom = new Rooms(findUser);
        UserSession userSession = new UserSession(findUser, session, null);

        //방마다 MediaPipeline 생성
        createdRoom.setMediaPipeline(kurentoClient.createMediaPipeline());

        roomRepository.save(createdRoom);
        createdRoom.addUserAndSession(userId, userSession);
        chatRoomMap.getRoomList().put(createdRoom.getRoomName(), createdRoom);

        log.info("방 생성 요청 - userId : {}, roomName : {}", findUser.getUserId(), createdRoom.getRoomName());
        RoomList.forEach((roomName, room) -> log.info("방 생성 요청 - 현재 존재하는 방 : {}", roomName));
        log.info("방 생성 요청 - 현재 방의 수 : " + RoomList.size());

        return createdRoom.getRoomName();
    }

    /*
    요청 세션에게 messageType 재전송
    - front 처리를 위해 요청 세션에게 messageType을 재전송
    - 방 생성(CREATE)시, roomName도 함께 넣어서 전송
     */
    public void sendMessageType(WebSocketSession session,String messageType, String roomName){
        Map<String, String> message = new HashMap<>();
        message.put("messageType", messageType);
        try {
            if(messageType.equals("CREATE")) {message.put("roomName", roomName);}
            String jsonMessage = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(jsonMessage));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }


    /*
    방 참가 메서드
    - 해당 유저와 해당 유저의 세션을 지정한 방에 참가시킴
    - 반환값으로 참가한 Rooms를 반환
    - Map과 DB에 있는 Rooms가 연동되지 않을 수 있으므로 주의 : 나중에 기능 추가 시 수정 요함
     */
    @Transactional
    public Rooms joinUser(String userId, WebSocketSession session, String roomName) throws IOException {
        User findUser = userRepository.findById(userId);
        //Rooms roomJoined = roomRepository.findRoomByName(roomName);
        Rooms roomJoined = chatRoomMap.getRoomFromRoomList(roomName);
        if(roomJoined != null) {
            findUser.setRoom(roomJoined);
            UserSession userSession = new UserSession(findUser, session, null);
            roomJoined.addUserAndSession(userId, userSession);

            log.info("방 참가 요청 - userId : " + findUser.getUserId());
            log.info("방 참가 요청 - roomName : " + roomJoined.getRoomName());

            roomJoined.getUserInRoomList().
                    forEach((key, value) -> log.info("방 참가 요청 - 방에 있는 유저 : userId : {}", key));

            return roomJoined;
        }
        session.sendMessage(new TextMessage("No Such Room"));
        return null;
    }

    /*
    메세지 전송 메서드
    - 메세지를 보낼 시, 자신(session)을 제외한 방에 있는 참가자들에게 메세지 전송
     */
    public void sendMessage(String message, WebSocketSession session, Rooms room) {
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

    /*
    messageType에 따른 동작 처리 메서드
    - messageType에 따라 각 다른 동작 수행
     */
    @Transactional
    public void handlerActions(WebSocketSession session, ChatMessage chatMessage) throws IOException {
        String roomName = chatMessage.getRoomName();
        String senderId = chatMessage.getUserId();

        switch(chatMessage.getMessageType()){
            case CREATE:
                String createdRoomName = createRoom(senderId, session);
                sendMessageType(session, "CREATE", createdRoomName);
                break;
            case JOIN:
                sendMessageType(session, "JOIN", null);
                chatMessage.setMessage(senderId + "님이 입장하셨습니다.");
                Rooms joinedRoom = joinUser(senderId, session, roomName);
                if(joinedRoom != null){
                    sendMessage(chatMessage.getMessage(), session, joinedRoom); }
                break;
            case TALK :
                sendMessageType(session, "TALK", null);
                Rooms talkRoom = RoomList.get(roomName);
                sendMessage(chatMessage.getMessage(),session, talkRoom);
                break;
            case SDP_OFFER:
                //메세지 받을 때 방 이름도 같이 받아야 함 또한 userId도 받아야함
                Rooms offeredRoom = RoomList.get(roomName);
                UserSession offeredUserSession = offeredRoom.getUserInRoomList().get(senderId);
                //WebRTCEndpoint 생성
                WebRtcEndpoint webRtcEndpoint = new WebRtcEndpoint.Builder(offeredRoom.getPipeline()).build();
                offeredUserSession.setWebRtcEndpoint(webRtcEndpoint);
                webRTCSignalingService.processSdpOffer(offeredUserSession, chatMessage);
                break;
            case ICE_CANDIDATE:
                Rooms iceRoom = RoomList.get(roomName);
                UserSession iceUserSession = iceRoom.getUserInRoomList().get(senderId);
                webRTCSignalingService.processIceCandidate(iceUserSession, chatMessage);
                break;

            /*
            이후 사람들과 연결을 해야함. 사용자가 서버로 보내는 하나의 stream을 mediapipeline과 연결하고
            나머지 방에 있는 사람들과 webrtcendpoint.connect(receiver)을 연결을 모두 해야함.
            그리고 새로운 사람과 연결되었을때나 연결이 끊어졌을때 업데이트하는 로직도 작성해야함.
            상대방이 나갔을때는 front에 나갔음을 websocket으로 알려주면 됨.
             */
        }
    }

    /*
    방에서 유저를 지우는 메서드
    - userInRoomList에서 해당 session을 찾아 Map<userId, WebSocketSession>을 삭제
    - user entity의 roomId를 null로 지정
     */
    @Transactional
    public void removeUserFromRoom(WebSocketSession session) {
        RoomList.values().stream()
                .filter(room -> room.getUserInRoomList().values().stream()
                        .map(UserSession::getWebSocketSession)
                        .collect(Collectors.toList())
                        .contains(session))
                .forEach(room -> room.getUserInRoomList().entrySet().removeIf(entry -> {
                    if (entry.getValue().getWebSocketSession().equals(session)) {
                        User user = userRepository.findById(entry.getKey());

                        log.info("방 나가기 - 방에 남아 있는 인원 : " + entry.getKey());
                        log.info("방 나가기 - userId : " + user.getUserId());
                        log.info("방 나가기 - roomName : " + room.getRoomName());

                        user.setRoom(null);
                        return true;
                    }
                    return false;
                }));
    }


}

