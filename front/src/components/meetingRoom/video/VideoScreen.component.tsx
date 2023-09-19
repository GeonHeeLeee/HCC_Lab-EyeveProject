import {useEffect, useRef} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../../store/types/redux.type";

type MediaConstraints = {
  video: boolean;
  audio: boolean;
}
type RTCOptions = {
  answers: any;
  offers: any;
}
type RTCMessage = MessageEvent<any> & RTCOptions
const constraints: MediaConstraints = {
  video: true,
  audio: true,
}

// TODO: Separate Me or Other
const VideoScreenComponent = () => {
  const {socket: mySocket} = useSelector((state: RootState) => state.socket);
  const videoRef = useRef<HTMLVideoElement>(null);

  async function playVideoFromCamera() {
    try {
      const stream = await openMediaDevices(constraints);
      console.log('Got MediaStream:', stream);
      (videoRef.current as HTMLVideoElement).srcObject = stream;
    } catch (error) {
      console.log(`Error accessing media devices.`, error);
    }
  }

  async function makeCall() {
    const configuration = {
      'iceServers': [{
        urls: 'stun:stun.l.google.com:19302'
      }]
    };

    const peerConnection = new RTCPeerConnection(configuration);
    mySocket?.addEventListener('message', async (message) => {
      console.log(message);
      // if (message.answer) {
      //   const remoteDesc = new RTCSessionDescription(message.answer);
      //   await peerConnection.setRemoteDescription(remoteDesc);
      // }
      // if (message.offer) {
      //   peerConnection.setRemoteDescription(new RTCPeerConnection(message.offer));
      //   const answer = await peerConnection.createAnswer();
      //   await peerConnection.setLocalDescription(answer);
      //   mySocket.send(JSON.stringify({answer}));
      // }
    })
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    mySocket?.send(JSON.stringify({offer}));
  }

  useEffect(() => {
    playVideoFromCamera();
  }, []);

  return (
      <article>
        <video autoPlay={true} muted={true} ref={videoRef} width={300} height={300}/>
        <audio
            autoPlay
            muted
            controls
            style={{display: "none"}}
        />
      </article>
  )
}

// Media 기기 시작하기
const openMediaDevices = async (constraints: MediaConstraints) => {
  return await navigator.mediaDevices.getUserMedia(constraints);
}


export default VideoScreenComponent;