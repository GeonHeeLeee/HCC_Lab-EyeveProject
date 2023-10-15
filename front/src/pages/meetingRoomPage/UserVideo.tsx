import { useEffect, useState, useRef, useCallback } from 'react';

import { WebRTCUser } from './rtc.type';

import Video from '../../components/meetingRoom/video/video';
import { getSocket, initSocket } from '../../services/socket';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types/redux.type';
import { error, log } from 'console';

const pc_config = {
  iceServers: [
    // {
    //   urls: 'stun:[STUN_IP]:[PORT]',
    //   'credentials': '[YOR CREDENTIALS]',
    //   'username': '[USERNAME]'
    // },
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
};

const UserVideo2 = () => {
  const dispatch = useDispatch();

  const loginUser = useSelector((state: RootState) => state.loginUser);

  const socketRef = useRef<WebSocket | null>(); // 서버와 통신할 소켓
  const localStreamRef = useRef<MediaStream>();

  const sendPCRef = useRef<RTCPeerConnection>();

  const localVideoRef = useRef<HTMLVideoElement>(null); // 자신의 MediaStream 출력할 video 태그의 ref
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // 상대방의 MediaStream 출력할 video 태그의 ref
  const [users, setUsers] = useState<Array<WebRTCUser>>([]);

  const createSenderOffer = useCallback(async () => {
    try {
      console.log(loginUser);

      if (!sendPCRef.current) return;
      const sdp = await sendPCRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      console.log('create sender offer success');
      await sendPCRef.current.setLocalDescription(
        new RTCSessionDescription(sdp)
      );

      if (!socketRef.current) return;

      console.log(socketRef.current);

      socketRef.current?.send(
        JSON.stringify({
          messageType: 'SDP_OFFER',
          roomName: loginUser.roomName,
          userId: loginUser.userId,
          sdpOffer: sdp.sdp,
        })
      );
    } catch (e) {
      console.log(e);
    }
  }, []);

  const createSenderPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(pc_config);

    pc.onicecandidate = (e) => {
      if (!(e.candidate && socketRef.current)) return;
      console.log('sender PC onicecandidate');
      // console.log(e.candidate.candidate);
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            messageType: 'ICE_CANDIDATE',
            iceCandidate: e.candidate,
            userId: loginUser.userId,
            roomName: loginUser.roomName,
          })
        );
      }
    };

    pc.oniceconnectionstatechange = (e) => {
      console.log(e);
    };

    pc.ontrack = (e) => {
      console.log('sender PC ontrack');

      const stream = e.streams[0];
      console.log(stream);

      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
      if (!socketRef.current) return;

      // setUsers((prevUsers) => [...prevUsers, { id: e.track.id, stream }]);
    };

    if (localStreamRef.current) {
      console.log('add local stream');
      localStreamRef.current.getTracks().forEach((track) => {
        if (!localStreamRef.current) return;
        pc.addTrack(track, localStreamRef.current);
        console.log('add local stream success');
      });
    } else {
      console.log('no local stream');
    }

    sendPCRef.current = pc;
  }, []);

  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 240,
          height: 240,
        },
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      if (!socketRef.current) return;

      createSenderPeerConnection();
      await createSenderOffer();
    } catch (error) {
      console.log(`getUserMedia error: ${error}`);
    }
  }, [createSenderOffer, createSenderPeerConnection]);

  useEffect(() => {
    initSocket();
    socketRef.current = getSocket();

    getLocalStream();

    if (socketRef.current) {
      socketRef.current.onmessage = function (e) {
        let data = JSON.parse(e.data);

        switch (data.messageType) {
          case 'SDP_ANSWER':
            (async (data: {
              messageType: string;
              SDP_ANSWER: string;
              userId: string;
            }) => {
              try {
                if (!sendPCRef.current) return;
                console.log('get sender answer');
                // console.log(data);
                // console.log(data.SDP_ANSWER);

                await sendPCRef.current.setRemoteDescription(
                  new RTCSessionDescription({
                    type: 'answer',
                    sdp: data.SDP_ANSWER,
                  })
                );
                console.log('sender set remote description success');
              } catch (error) {
                console.log(error);
              }
            })(data);
            break;

          case 'ICE_CANDIDATE':
            (async (data: { candidate: RTCIceCandidateInit }) => {
              try {
                if (!(data.candidate && sendPCRef.current)) return;
                console.log('get sender candidate');
                await sendPCRef.current.addIceCandidate(
                  new RTCIceCandidate(data.candidate)
                );
                console.log('candidate add success');
              } catch (error) {
                console.log(error);
              }
            })(data);
            break;

          // case 'SDP_OFFER':
          //   (async (data: {
          //     messageType: string;
          //     SDP_OFFER: string;
          //     userId: string;
          //   }) => {
          //     try {
          //       if (!sendPCRef.current) return;
          //       console.log('get sender offer');

          //       await sendPCRef.current.setRemoteDescription(
          //         new RTCSessionDescription({
          //           type: 'offer',
          //           sdp: data.SDP_OFFER,
          //         })
          //       );
          //       const sdpAnswer = await sendPCRef.current.createAnswer();

          //       await sendPCRef.current.setLocalDescription(sdpAnswer);

          //       socketRef.current?.send(
          //         JSON.stringify({
          //           messageType: 'SDP_ANSWER',
          //           roomName: loginUser.roomName,
          //           userId: loginUser.userId,
          //           sdpAnswer: sdpAnswer.sdp,
          //         })
          //       );
          //     } catch (error) {
          //       console.log(error);
          //     }
          //   })(data);
          //   break;

          case '':
            break;

          default:
            console.log('error');

            break;
        }
      };
      return () => {
        if (sendPCRef.current) {
          sendPCRef.current.close();
        }
      };
    }
  }, [getLocalStream, createSenderOffer]);
  // }, []);

  return (
    <div>
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: 'black',
        }}
        muted
        ref={localVideoRef}
        autoPlay
      />
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: 'black',
        }}
        muted
        ref={remoteVideoRef}
        autoPlay
      />

      {users.map((user, index) => (
        <Video key={index} stream={user.stream} />
      ))}
    </div>
  );
};

export default UserVideo2;
