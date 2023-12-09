package hcclab.eyeveProject.entity;

import hcclab.eyeveProject.domain.UserSession;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.kurento.client.MediaPipeline;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Transient;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;


@Getter
@RequiredArgsConstructor
@Entity
public class Rooms {

    @Transient
    private Map<String, UserSession> userInRoomList = new HashMap<>();

    /*
    방마다 존재해는 MediaPipeline
    - 방 마다 한개씩 존재
     */
    @Transient
    private MediaPipeline pipeline;

    @GeneratedValue
    @Id
    private Long roomId;
    private String roomName;
    private LocalDateTime createdTime;

    /*
    해당 방에 있는 유저의 List
    - <userId, UserSession> 저장
    - DB에 등록하지 않으므로 @Transient
     */


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
    userInRoomList에 <userId, UserSession> 추가
     */
    public void addUserAndSession(String userId, UserSession userSession) {
        userInRoomList.put(userId, userSession);
    }

    public void setMediaPipeline(MediaPipeline mediaPipeline) {
        this.pipeline = mediaPipeline;
    }
}
