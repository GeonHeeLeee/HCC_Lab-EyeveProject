package hcclab.eyeveProject.service;

import hcclab.eyeveProject.entity.User;
import hcclab.eyeveProject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.Optional;

@Service
public class LoginService {

    @Autowired
    private UserRepository userRepository;

    /*
    회원 가입 메서드
    - validateUser(중복 유저 검사) 반환 값을 토대로 false 또는 저장 후 true 반환
     */
    @Transactional
    public boolean registerUser(User user) {
        if(validateUser(user)) {return false;}
        userRepository.save(user);
        return true;
    }
    /*
    중복 유저 검사 메서드
    - 동일 아이디 존재 검사 후 해당 아이디의 유저 존재 시 true, 없을 시 false 반환
     */
    public boolean validateUser(User user) {
        Optional<User> findUser = Optional.ofNullable(userRepository.findById(user.getUserId()));
        return findUser.isPresent();
    }

    /*
    유저 조회 메서드
    - userId로 DB에서 유저 조회 후 User 객체 반환
     */
    public User findUserById(String userId) {
        return userRepository.findById(userId);
    }

    /*
    로그인 체크 메서드
    - 해당 userId의 유저가 존재하고, 입력한 비밀번호가 일치하면 true 반환
    - 해당 유저가 존재하지 않거나, 비밀번호가 틀릴 시 false 반환
     */
    public boolean loginCheck(User user) {
        Optional<User> findUser = Optional.ofNullable(findUserById(user.getUserId()));
        return findUser.isPresent() && findUser.get().getUserPassword().equals(user.getUserPassword());
    }

    /*
    세션 생성 메서드
    - 해당 유저 아이디로 세션을 생성하고 넣어줌
     */
    public void createSession(HttpServletRequest request, String userId) {
        HttpSession session = request.getSession();
        session.setAttribute("user", userId);
    }
}
