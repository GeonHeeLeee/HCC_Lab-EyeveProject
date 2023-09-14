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
