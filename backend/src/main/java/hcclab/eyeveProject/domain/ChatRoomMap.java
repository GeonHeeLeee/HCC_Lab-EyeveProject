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
    //생성된 방의 List - Map<roomName, Rooms>
    private Map<String, Rooms> RoomList = new HashMap<>();

    private ChatRoomMap(){};

    public static ChatRoomMap getInstance(){
        return chatRoomMap;
    }
    public Map<String, Rooms> getRoomList() {
        return RoomList;
    }

    //RoomList에 저장된 room 삭제 메서드
    public void deleteRoom(String roomName) {
        RoomList.remove(roomName);
    }

    /*
    해당 Room이 존재하는지 확인하는 메서드
    - 해당 Room이 존재하면 Room 반환
    - 존재하지 않으면 null 반환
     */
    public Rooms getRoomFromRoomList(String roomName) {
        if(RoomList.containsKey(roomName)){
            return RoomList.get(roomName);
        }
        return null;
    }

}
