package hcclab.eyeveProject.entity;

import hcclab.eyeveProject.entity.enumType.EmojiType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
@Entity
@Getter @Setter
@RequiredArgsConstructor
public class Emoji {

    @Id
    @GeneratedValue
    private Long id;
    @Enumerated(EnumType.STRING)
    private EmojiType emojiType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roomId")
    private Rooms room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private User user;

    //private int emojiCount;

    private LocalDateTime sentTime;
}
