package hcclab.eyeveProject.repository;

import hcclab.eyeveProject.entity.Rooms;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;

@RequiredArgsConstructor
@Repository
public class RoomRepository {

    @Autowired
    private EntityManager em;

    /*
    DB 방 조회 메서드
    - roomName으로 DB에 query를 날려 방 반환
     */
    @Transactional
    public Rooms findRoomByName(String roomName) {
        Rooms findRoom = em.createQuery("select r from Rooms r where r.roomName = :roomName",Rooms.class)
                            .setParameter("roomName", roomName)
                            .getSingleResult();
        return findRoom;
    }


    /*
    DB 방 저장 메서드
    - 해당 방을 DB에 저장함
     */
    @Transactional
    public void save(Rooms createdRoom) {
        em.persist(createdRoom);
    }
}
