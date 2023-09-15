package hcclab.eyeveProject.service;

import hcclab.eyeveProject.domain.ChatMessage;
import hcclab.eyeveProject.domain.ChatRoomMap;
import hcclab.eyeveProject.entity.Rooms;
import hcclab.eyeveProject.entity.User;
import hcclab.eyeveProject.repository.RoomRepository;
import hcclab.eyeveProject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Map;

@Service
public class ChatRoomService {

    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private UserRepository userRepository;

    private ChatRoomMap chatRoomMap = ChatRoomMap.getInstance();

    private Map<String, Rooms> RoomList = chatRoomMap.getRoomList();

    /*
    방 생성 메서드
    - 방을 생성하고, 연관 관계 지정 후, DB 저장
    - 반환 값으로 roomName(roomUUID를 반환)
     */
    @Transactional
    public String createRoom(String userId, WebSocketSession session) {
        User findUser = userRepository.findById(userId);

        Rooms createdRoom = new Rooms(findUser);
        roomRepository.save(createdRoom);

        createdRoom.addUserAndSession(userId, session);

        chatRoomMap.getRoomList().put(createdRoom.getRoomName(), createdRoom);

        return createdRoom.getRoomName();
    }

    /*
    방 참가 메서드
    - 해당 유저와 해당 유저의 세션을 지정한 방에 참가시킴
    - 반환값으로 참가한 Rooms를 반환
     */
    @Transactional
    public Rooms joinUser(String userId, WebSocketSession session, String roomName) {
        User findUser = userRepository.findById(userId);
        Rooms roomJoined = RoomList.get(roomName);
        roomJoined.addUser(findUser);
        roomJoined.addUserAndSession(userId, session);
        return roomJoined;
    }

    /*
    메세지 전송 메서드
    - 메세지를 보낼 시, 자신(session)을 제외한 방에 있는 참가자들에게 메세지 전송
     */
    public void sendMessage(String message, WebSocketSession session, Rooms room) {
        room.getUserInRoomList().values().parallelStream()
                .filter(s -> s != session)
                .forEach(s -> {
                    try {
                        s.sendMessage(new TextMessage(message));
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
    public void handlerActions(WebSocketSession session, ChatMessage chatMessage){
        String roomName = chatMessage.getRoomName();
        String senderId = chatMessage.getUserId();

        Rooms room;
        switch(chatMessage.getMessageType()){
            case CREATE:
                createRoom(senderId, session);
                break;
            case JOIN:
                chatMessage.setMessage(senderId + "님이 입장하셨습니다.");
                Rooms joinedRoom = joinUser(senderId, session, roomName);
                sendMessage(chatMessage.getMessage(), session, joinedRoom);
                break;
            case TALK :
                Rooms talkRoom = RoomList.get(roomName);
                sendMessage(chatMessage.getMessage(),session, talkRoom);
                break;
        }
    }

}

