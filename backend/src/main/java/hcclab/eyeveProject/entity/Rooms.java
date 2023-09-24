package hcclab.eyeveProject.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.WebSocketSession;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Getter
@RequiredArgsConstructor
public class Rooms {

    @GeneratedValue @Id
    private Long roomId;
    private String roomName;
    private LocalDateTime createdTime;

    /*
    해당 방에 있는 유저의 List
    - <userId, WebSocketSession> 저장
    - DB에 등록하지 않으므로 @Transient
     */
    @Transient
    private Map<String, WebSocketSession> userInRoomList = new HashMap<>();

    /*
    Rooms 생성자
    - 방 생성 시, 방 생성 시간을 초기화
    - 방 생성 시, DB User table에 해당 유저의 방 number 입력
     */
    public Rooms(User user) {
        this.roomName = UUID.randomUUID().toString();
        user.setRoom(this);
        this.createdTime = LocalDateTime.now();
    }

    /*
    userInRoomList에 <userId, WebSocketSession> 추가
     */
    public void addUserAndSession(String userId, WebSocketSession session){
        userInRoomList.put(userId, session);
    }

}
