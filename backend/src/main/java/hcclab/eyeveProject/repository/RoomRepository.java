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

    @Transactional
    public Rooms findRoomByName(String roomName) {
        Rooms findRoom = em.createQuery("select r from Rooms r where r.roomName = :roomName",Rooms.class)
                            .setParameter("roomName", roomName)
                            .getSingleResult();
        return findRoom;
    }


    @Transactional
    public void save(Rooms createdRoom) {
        em.persist(createdRoom);
    }
}
