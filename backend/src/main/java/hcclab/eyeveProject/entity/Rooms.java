package hcclab.eyeveProject.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
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
    @OneToMany(mappedBy = "room")
    private List<User> users = new ArrayList<>();

    private LocalDateTime createdTime;

     /*
     연관관계 편의 메서드
      */
    public void addUser(User user) {
        users.add(user);
        user.setRoom(this);
    }

    @Transient
    private Map<String, WebSocketSession> userInRoomList = new HashMap<>();

    public Rooms(User user) {
        this.roomName = UUID.randomUUID().toString();
        addUser(user);
        this.createdTime = LocalDateTime.now();
    }

    public void addUserAndSession(String userId, WebSocketSession session){
        userInRoomList.put(userId, session);
    }

}
