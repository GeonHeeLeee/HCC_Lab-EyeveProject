package hcclab.eyeveProject.entity;


import lombok.Getter;
import lombok.RequiredArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@RequiredArgsConstructor
public class Chat {

    @Id
    @GeneratedValue
    private Long id; //메세지 고유 식별 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roomId")
    private Rooms room;

    //private String sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private User user;

    private String payload;

    private LocalDateTime sentTime;

    //private WebSocketSession webSocketSession;
}
