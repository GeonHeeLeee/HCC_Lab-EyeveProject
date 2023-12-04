package hcclab.eyeveProject.config;

import hcclab.eyeveProject.interceptor.LoginInterceptor;
import org.kurento.client.KurentoClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /*
    CORS 문제 해결 메서드
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("OPTIONS", "GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);
    }

    /*
    Interceptor 등록, 세션 처리 메서드
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginInterceptor())
                .addPathPatterns("/**")
                .excludePathPatterns("/users", "/users/login");
    }

    // Kurento Media Server 를 사용하기 위한 Bean 설정
    // Bean 으로 등록 후 반드시!! VM 옵션에서 kurento 관련 설정을 해주어야한다.
    // 아니면 에러남
    @Bean
    public KurentoClient kurentoClient() {
        return KurentoClient.create();
    }


}
