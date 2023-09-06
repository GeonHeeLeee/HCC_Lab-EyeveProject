package hcclab.eyeveProject.entity;


import hcclab.eyeveProject.entity.enumType.UserType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter @Setter
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
}
