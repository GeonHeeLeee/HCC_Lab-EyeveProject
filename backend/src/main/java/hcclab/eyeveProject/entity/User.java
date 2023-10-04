package hcclab.eyeveProject.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import hcclab.eyeveProject.entity.enumType.UserType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@RequiredArgsConstructor
public class User {
    @Id
    private String userId;

    private String userPassword;
    private String userName;

    @Enumerated(EnumType.STRING)
    private UserType userType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roomId")
    private Rooms room;

    public void setRoom(Rooms room) {
        this.room = room;
    }
}
