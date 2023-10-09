package hcclab.eyeveProject.domain;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IceCandidatePayload {
    private String candidate;
    private String sdpMid;
    private int sdpMLineIndex;

    public IceCandidatePayload(String candidate, String sdpMid, int sdpMLineIndex) {
        this.candidate = candidate;
        this.sdpMid = sdpMid;
        this.sdpMLineIndex = sdpMLineIndex;
    }
}
