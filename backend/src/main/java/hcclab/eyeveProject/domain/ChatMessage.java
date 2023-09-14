package hcclab.eyeveProject.domain;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessage {
    public enum MessageType {
        CREATE, JOIN, TALK;
    }

    private String roomName;
    private String userId;
    private MessageType messageType;
    private String message;
}
