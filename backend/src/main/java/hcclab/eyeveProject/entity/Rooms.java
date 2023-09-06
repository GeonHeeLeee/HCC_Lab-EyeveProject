package hcclab.eyeveProject.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter
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
}
