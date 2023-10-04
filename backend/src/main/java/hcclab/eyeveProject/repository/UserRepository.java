package hcclab.eyeveProject.repository;

import hcclab.eyeveProject.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;

@RequiredArgsConstructor
@Repository
public class UserRepository {

    @Autowired
    private EntityManager em;

    /*
    저장 메서드
    - DB에 해당 user를 저장함
     */
    public void save(User user) {
        em.persist(user);
    }

    /*
    회원 조회 메서드
    - 해당 userId의 유저를 조회
     */
    public User findById(String userId) {
        return em.find(User.class, userId);
    }
}
