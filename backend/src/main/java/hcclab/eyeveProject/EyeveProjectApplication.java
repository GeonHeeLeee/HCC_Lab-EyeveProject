package hcclab.eyeveProject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.persistence.EntityManager;

@SpringBootApplication
public class EyeveProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(EyeveProjectApplication.class, args);
	}

}
