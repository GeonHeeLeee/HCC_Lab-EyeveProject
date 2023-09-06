package hcclab.eyeveProject.interceptor;

import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class LoginInterceptor implements HandlerInterceptor {

    /*
    세션 처리 메서드
    - 세션을 조회하여 유효하면 요청 진행
    - 세션이 유효하지 않을 시, 401 Unauthorized 응답
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        HttpSession session = request.getSession();
        if (session.getAttribute("user") == null) {
            response.sendError(401);
            return false;
            //요청 흐름 중단 : 즉, 컨트롤러의 핸들러 메서드로 넘어가지 않고 끝남
        }
        return true; //현재 요청 계속 처리
    }
}
