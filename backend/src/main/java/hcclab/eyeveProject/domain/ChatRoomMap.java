package hcclab.eyeveProject.domain;

import hcclab.eyeveProject.entity.Rooms;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@Slf4j
public class ChatRoomMap {
    /*
    생성된 방들의 정보를 담는 ChatRoomMap
    - 하나만 존재해야 하므로 singleton으로 만듦
     */
    private static ChatRoomMap chatRoomMap = new ChatRoomMap();
    private Map<String, Rooms> RoomList = new HashMap<>();

    private ChatRoomMap(){};

    public static ChatRoomMap getInstance(){
        return chatRoomMap;
    }
    public Map<String, Rooms> getRoomList() {
        return RoomList;
    }

}
