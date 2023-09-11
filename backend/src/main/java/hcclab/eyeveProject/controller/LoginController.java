package hcclab.eyeveProject.controller;

import hcclab.eyeveProject.entity.User;
import hcclab.eyeveProject.service.LoginService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@Controller
@Slf4j
public class LoginController {

    @Autowired
    private LoginService loginService;

    /*
    회원 가입
    - 회원 가입 성공 시 : 유저 저장 후 200 OK 반환
    - 회원 가입 실패 시 : 400 Bad Request 반환
     */
    @PostMapping("/users")
    public ResponseEntity<Void> registerUser(@RequestBody User user) {
        boolean registerUserResult = loginService.registerUser(user);
        log.info("회원 가입 사용자 이름 : " + user.getUserId() + ", 비밀번호 : " + user.getUserPassword());
        log.info("회원 가입 성공 여부 : " + registerUserResult);
        return registerUserResult ?
                new ResponseEntity<>(HttpStatus.OK) : new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    /*
    로그인
    - 로그인 성공 시 : 세션 생성 후 200 OK 반환
    - 로그인 실패 시 : 세션 생성 하지 않고 400 Bad Request 반환
     */
    @PostMapping("/users/login")
    public ResponseEntity<String> loginUser(@RequestBody User user,
                                          HttpServletRequest request) {
        boolean loginCheckResult = loginService.loginCheck(user);

        log.info("로그인 사용자 이름 : " + user.getUserId() + ", 비밀번호 : " + user.getUserPassword());
        log.info("로그인 성공 여부 : " + loginCheckResult);

        if (loginCheckResult) {
            loginService.createSession(request, user.getUserId());
            return new ResponseEntity<String>(loginService.getUserNameById(user.getUserId()), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    /*
    자동 로그인 메서드
    - 만약 세션이 유효하지 않다면 Interceptor에서 먼저 처리 후 401 응답
    - 만약 세션이 유효하다면 해당 메서드로 넘어와서 200 반환
     */
    @GetMapping("/auto-login")
    @ResponseStatus(HttpStatus.OK)
    public void autoLogin() {
    }

}
