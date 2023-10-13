package hcclab.eyeveProject.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
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
