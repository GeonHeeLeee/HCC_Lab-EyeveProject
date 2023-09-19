package hcclab.eyeveProject.domain;

import hcclab.eyeveProject.entity.Rooms;
import hcclab.eyeveProject.entity.enumType.UserType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@Getter @Setter
public class UserDTO {
    private String userId;
    private String userName;
    private UserType userType;
    private Rooms room;
}
