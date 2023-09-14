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
    방을 생성하고, 반환 값으로 roomName(roomUUID를 반환)
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

    @Transactional
    public Rooms joinUser(String userId, WebSocketSession session, String roomName) {
        User findUser = userRepository.findById(userId);
        Rooms roomJoined = RoomList.get(roomName);
        roomJoined.addUser(findUser);
        roomJoined.addUserAndSession(userId, session);
        return roomJoined;
    }

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

