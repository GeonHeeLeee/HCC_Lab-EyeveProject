package hcclab.eyeveProject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
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
import org.springframework.web.servlet.tags.form.OptionsTag;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import java.io.IOException;
import java.util.*;
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
    public String createRoom(ChatMessage chatMessage, WebSocketSession session) {
        String userId = chatMessage.getUserId();

        User findUser = userRepository.findById(userId);
        Rooms createdRoom = new Rooms(findUser);
        UserSession userSession = new UserSession(findUser, session, null);

        //방마다 MediaPipeline 생성
        createdRoom.setMediaPipeline(kurentoClient.createMediaPipeline());
        webRTCSignalingService.createWebRTCEp(createdRoom,userSession, chatMessage);


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
    public synchronized void sendMessageType(WebSocketSession session,String messageType, String roomName){
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
    방 참가 메서드
    - 해당 유저와 해당 유저의 세션을 지정한 방에 참가시킴
    - 반환값으로 참가한 Rooms를 반환
    - Map과 DB에 있는 Rooms가 연동되지 않을 수 있으므로 주의 : 나중에 기능 추가 시 수정 요함
     */
    @Transactional
    public Rooms joinUser(ChatMessage chatMessage, WebSocketSession session) throws IOException {
        String userId = chatMessage.getUserId();
        String roomName = chatMessage.getRoomName();

        User findUser = userRepository.findById(userId);
        Rooms roomJoined = chatRoomMap.getRoomFromRoomList(roomName);

        if(roomJoined != null) {
            findUser.setRoom(roomJoined);
            UserSession newUserSession = new UserSession(findUser, session, null);

            //WebRTCEndpoint 생성
            webRTCSignalingService.createWebRTCEp(roomJoined, newUserSession, chatMessage);
            roomJoined.addUserAndSession(userId, newUserSession);

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
    public synchronized void sendMessage(String message, WebSocketSession session, Rooms room) {
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
    public synchronized void handlerActions(WebSocketSession session, ChatMessage chatMessage) throws IOException {
        String roomName = chatMessage.getRoomName();
        String senderId = chatMessage.getUserId();
        String receiverId = chatMessage.getReceiverId();

        switch(chatMessage.getMessageType()){
            case CREATE:
                String createdRoomName = createRoom(chatMessage, session);
                sendMessageType(session, "CREATE", createdRoomName);
                break;

            case JOIN:
                Rooms joinedRoom = joinUser(chatMessage, session);
                sendMessageType(session, "JOIN", roomName);
                chatMessage.setMessage(senderId + "님이 입장하셨습니다.");
                if(joinedRoom != null){


                    //방에 있는 기존 사람들에게 새로 들어온 사람의 id 보내기
                    String userEnterMessage = makeUserEnterMessage(senderId);
                    sendMessage(userEnterMessage, session, joinedRoom);

                    //메세지 보낸 사람
                    UserSession senderSession = joinedRoom.getUserInRoomList().values().stream()
                            .filter(userSession -> (userSession.getUser().getUserId() == senderId)).
                            findAny().get();
                    Map senderDownStream = senderSession.getDownStreams();

                    //방에 있는 사람들이 새로 들어온 사람에 대해 WebRtcEndpoint 생성 후 downStream에 저장
                    joinedRoom.getUserInRoomList().values().stream()
                            .forEach(userSession -> {
                                if (userSession.getUser().getUserId() != senderId) {
                                    //기존 방에 있던 사람들이 새로운 사람의 endpoint 생성 후 연결
                                    webRTCSignalingService.createDownStreamEndpoint(joinedRoom, userSession, chatMessage,senderSession);
                                    //새로 들어온 사람이 기존 사람들의 endpoint 생성 후 연결
                                    webRTCSignalingService.createDownStreamEndpoint(joinedRoom,senderSession,chatMessage, userSession);

                                }
                            }
                            );

                }
                break;

            case CHAT :
                sendMessageType(session, "CHAT", null);
                Rooms talkRoom = RoomList.get(roomName);
                sendMessage(chatMessage.getMessage(),session, talkRoom);
                break;

            case SDP_OFFER :
                //메세지 받을 때 방 이름도 같이 받아야 함 또한 userId도 받아야함
                log.info("MessageType : SDP_OFFER");
                log.info("sdpOffer Sender : " + senderId);
                Rooms offeredRoom = RoomList.get(roomName);
                //새로 들어온 사람에게 메세지 보내기
                String userInRoomMessage = makeUserInRoomMessage(offeredRoom);
                session.sendMessage(new TextMessage(userInRoomMessage));

                UserSession offeredUserSession = offeredRoom.getUserInRoomList().get(senderId);
                webRTCSignalingService.processSdpOffer(offeredUserSession, chatMessage);
                break;

            case ICE_CANDIDATE:
                log.info("MessageType : ICE_CANDIDATE, senderId: {}, receiverId: {}", chatMessage.getUserId(),chatMessage.getReceiverId());
                Rooms iceRoom = RoomList.get(roomName);

                WebRtcEndpoint iceWebRtcEndpoint = iceRoom.getUserInRoomList().get(senderId).getWebRtcEndpoint();
                WebRtcEndpoint receiverWebRtcEndpoint = iceRoom.getUserInRoomList().get(senderId).getDownStreams().get(chatMessage.getReceiverId());
                webRTCSignalingService.processIceCandidate(iceWebRtcEndpoint,receiverWebRtcEndpoint, chatMessage);
                break;

            case RECEIVER_SDP_OFFER:
                //senderId - 처음 큰 객체
                //receiverId - 생성한 작은 객체
                //처음 큰 객체의 UserSession으로 가서 작은 객체의 downStream 찾고 그 downStream에 대한 sdp

                Rooms room = RoomList.get(roomName);
                UserSession senderUserSession = room.getUserInRoomList().get(senderId);
                log.info("RECEIVER_SDP_OFFER : senderId - {}",senderUserSession.getUser().getUserId());
                log.info("RECEIVER_SDP_OFFER : receiverId - {}",receiverId);

                WebRtcEndpoint receiverEndpoint = senderUserSession.getDownStreams().get(receiverId);
                log.info("RECEIVER_SDP_OFFER : {}의 DownStream - {}",senderUserSession.getUser().getUserId(),senderUserSession.getDownStreams().keySet());
                webRTCSignalingService.processReceiverSdpOffer(senderUserSession,receiverEndpoint, chatMessage);
                break;
            case LEAVE:


        }
    }

    /*
    방에서 유저를 지우는 메서드
    - userInRoomList에서 해당 session을 찾아 Map<userId, WebSocketSession>을 삭제
    - user entity의 roomId를 null로 지정
     */
    @Transactional
    public void removeUserFromRoom(WebSocketSession session) {
        Rooms foundRoom = getRoomByWebSocketSession(session);
        Iterator<Map.Entry<String, UserSession>> iter = foundRoom.getUserInRoomList().entrySet().iterator();
        while (iter.hasNext()) {
            Map.Entry<String, UserSession> entry = iter.next();
            if (entry.getValue().getWebSocketSession().equals(session)) {
                User user = userRepository.findById(entry.getKey());

                log.info("방 나가기 - 방에 남아 있는 인원 : " + entry.getKey());
                log.info("방 나가기 - userId : " + user.getUserId());
                log.info("방 나가기 - roomName : " + foundRoom.getRoomName());

                // 다른 사람들의 downStream도 Release 후 삭제
                releaseUsersDownStream(user, foundRoom);

                user.setRoom(null);
                iter.remove();
            }
        }


    }


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
    WebSocketSession으로 해당 유저가 있는 방 찾기
    - 현재 findAny()로 유저가 존재하는 방 하나만 찾기
    - 즉, 한 유저가 여러개의 방에 존재할수는 없음
     */
    public Rooms getRoomByWebSocketSession(WebSocketSession webSocketSession) {
        Rooms foundRoom = RoomList.values().stream()
                .filter(room -> room.getUserInRoomList().values().stream()
                        .map(UserSession::getWebSocketSession)
                        .collect(Collectors.toList())
                        .contains(webSocketSession))
                .findAny()
                .orElseThrow(() -> new NoSuchElementException("getRoomByWebSocketSession: 유저가 있는 방 없음"));;
        return foundRoom;
    }

    /*
    WebRTCEndpoint Release 시키기
    - 해당 유저의 DownStream과 다른 유저들의 DownStream에서 해당 유저 release
     */
    public void releaseUsersDownStream(User leftUser, Rooms foundRoom) {
        for (UserSession user : foundRoom.getUserInRoomList().values()) {
            //기존에 방에 있던 사람들의 DownStream에서 해당 유저 release
            if (leftUser.getUserId() != user.getUser().getUserId()) {
                WebRtcEndpoint leftEndpoint = user.getDownStreams().get(leftUser.getUserId());
                if (leftEndpoint != null) {
                    leftEndpoint.release();
                    log.info("방 나가기 - {}의 {} Ep Release", user.getUser().getUserId(), leftUser.getUserId());
                    user.getDownStreams().remove(leftUser.getUserId());
                }
            }
            //해당 유저의 DownStream들 release
            else {
                Iterator<Map.Entry<String, WebRtcEndpoint>> iterator = user.getDownStreams().entrySet().iterator();
                while (iterator.hasNext()) {
                    Map.Entry<String, WebRtcEndpoint> entry = iterator.next();
                    entry.getValue().release();
                    log.info("방 나가기 - {}의 {} Ep Release", leftUser.getUserId(), entry.getKey());
                    iterator.remove();
                }
                user.getWebRtcEndpoint().release();
                log.info("방 나가기 - {}의 Ep Release {}", user.getUser().getUserId());
            }
        }
    }




}

