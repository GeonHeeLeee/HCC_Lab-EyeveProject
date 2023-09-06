package hcclab.eyeveProject.entity;

import hcclab.eyeveProject.entity.enumType.LearningStatusType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter @Setter
@RequiredArgsConstructor
@Table(name = "learning_status")
public class LearningStatus {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roomId")
    private Rooms room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private User user;

    private int intervalTime; //List로 한 유저가 하나의 리스트로
    //10초당 저장 - 넘어가 있는 비율
    //차라리 인덱스 번호로 조회? - ArrayList 같은 것으로 유저 하나마다 배열 형태로 저장하는것도 괜찮을듯?
    //10초마다 ArrayList에 Add하는 식으로하면 10초 단위로 확인 가능?
    //값 타입 컬렉션 고려도 가능할듯
    /*
    아니면 Map으로 구성해서 <int, String>으로 구간 별로 가능할듯
     */

    @Enumerated(EnumType.STRING)
    private LearningStatusType userLearningStatus;

}
