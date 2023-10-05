import React, { useState, useRef, useEffect, useCallback } from 'react';
import Video from '../../components/meetingRoom/video/video';

import { WebRTCUser } from './rtc.type';

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

const SOCKET_SERVER_URL = 'ws://localhost:8081/socket';

const userVideo = () => {
  const socketRef = useRef<WebSocket>();
  const localStreamRef = useRef<MediaStream>();
  const sendPCRef = useRef<RTCPeerConnection>();
  const receivePCsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
  const [users, setUsers] = useState<Array<WebRTCUser>>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  const closeReceivePC = useCallback((id: string) => {
    if (!receivePCsRef.current[id]) return;
    receivePCsRef.current[id].close();
    delete receivePCsRef.current[id];
  }, []);

  const createReceiverOffer = useCallback(
    async (pc: RTCPeerConnection, senderSocketID: string) => {
      try {
        const sdp = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        console.log('create receiver offer success');
        await pc.setLocalDescription(new RTCSessionDescription(sdp));

        if (!socketRef.current) return;
        socketRef.current.onopen = function (event) {
          socketRef.current?.send(
            JSON.stringify({
              // TODO: 보내는 데이터 확인 후 다시 작성
              sdp,
              roomName: '',
              userId: '',
              messageType: 'SDP_OFFER',
            })
          );
        };
      } catch (error) {
        console.log(error);
      }
    },
    []
  );

  const createReceiverPeerConnection = useCallback((socketID: string) => {
    try {
      const pc = new RTCPeerConnection(pc_config);

      receivePCsRef.current = { ...receivePCsRef.current, [socketID]: pc };

      pc.onicecandidate = (e) => {
        if (!(e.candidate && socketRef.current)) return;
        console.log('receiver PC onicecandidate');
        socketRef.current.onopen = function (event) {
          socketRef.current?.send(
            JSON.stringify({
              // TODO: 보내는 데이터 확인 후 다시 작성
              candidate: e.candidate,
              //   receiverSocketID: socketRef.current.id,
              senderSocketID: socketID,
            })
          );
        };
      };

      pc.oniceconnectionstatechange = (e) => {
        console.log(e);
      };

      pc.ontrack = (e) => {
        console.log('ontrack success');
        setUsers((oldUsers) =>
          oldUsers
            .filter((user) => user.id !== socketID)
            .concat({ id: socketID, stream: e.streams[0] })
        );
      };
      return pc;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }, []);

  const createReceivePC = useCallback(
    (id: string) => {
      try {
        console.log(`socketID(${id}) user entered`);
        const pc = createReceiverPeerConnection(id);
        if (!(socketRef.current && pc)) return;
        createReceiverOffer(pc, id);
      } catch (error) {
        console.log(error);
      }
    },
    [createReceiverOffer, createReceiverPeerConnection]
  );

  const createSenderOffer = useCallback(async () => {
    try {
      if (!sendPCRef.current) return;
      const sdp = await sendPCRef.current.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });
      console.log('create sender offer success');
      await sendPCRef.current.setLocalDescription(
        new RTCSessionDescription(sdp)
      );

      if (!socketRef.current) return;
      socketRef.current.onopen = function () {
        socketRef.current?.send(
          JSON.stringify({
            // TODO: 데이터 형식 맞춰 바꾸기
            messageType: 'SDP_OFFER',
            sdp,
            // senderSocketID: socketRef.current.id,
            roomID: '',
          })
        );
      };
    } catch (error) {
      console.log(error);
    }
  }, []);

  const createSenderPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(pc_config);

    pc.onicecandidate = (e) => {
      if (!(e.candidate && socketRef.current)) return;
      console.log('sender PC onicecandidate');
      socketRef.current.onopen = function () {
        socketRef.current?.send(
          JSON.stringify({
            candidate: e.candidate,
            // senderSocketID: socketRef.current.id,
          })
        );
      };
    };
    pc.oniceconnectionstatechange = (e) => {
      console.log(e);
    };

    if (localStreamRef.current) {
      console.log('add local stream');
      localStreamRef.current.getTracks().forEach((track) => {
        if (!localStreamRef.current) return;
        pc.addTrack(track, localStreamRef.current);
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

      socketRef.current.onopen = function () {
        socketRef.current?.send(
          JSON.stringify({
            messageType: 'JOIN',
            userId: '',
            roomName: '',
          })
        );
      };
    } catch (error) {
      console.log(`getUserMedia error: ${error}`);
    }
  }, [createSenderOffer, createSenderPeerConnection]);

  useEffect(() => {
    socketRef.current = new WebSocket(SOCKET_SERVER_URL);
    getLocalStream();

    socketRef.current.onmessage = function (e) {
      let data = JSON.parse(e.data);

      switch (data.messageType) {
        case 'userEnter':
          createReceivePC(data.id);
          break;
        case 'allUsers':
          data.users.forEach((user: any) => createReceivePC(user.id));
          break;
        case 'userExit':
          closeReceivePC(data.id);
          setUsers((users) => users.filter((user) => user.id !== data.id));
          break;
        case 'getSenderAnswer':
          async (data: { sdp: RTCSessionDescription }) => {
            try {
              if (!sendPCRef.current) return;
              console.log('get sender answer');
              console.log(data.sdp);
              await sendPCRef.current.setRemoteDescription(
                new RTCSessionDescription(data.sdp)
              );
            } catch (error) {
              console.log(error);
            }
          };
          break;

        case 'getSenderCandidate':
          async (data: { candidate: RTCIceCandidateInit }) => {
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
          };
          break;

        case 'getReceiverAnswer':
          async (data: { id: string; sdp: RTCSessionDescription }) => {
            try {
              console.log(`get socketID(${data.id}'s answer)`);
              const pc: RTCPeerConnection = receivePCsRef.current[data.id];
              if (!pc) return;
              await pc.setRemoteDescription(data.sdp);
              console.log(`socketID(${data.id})'s set remote sdp success`);
            } catch (error) {
              console.log(error);
            }
          };
          break;

        case 'getReceiverCandidate':
          async (data: { id: string; candidate: RTCIceCandidateInit }) => {
            try {
              console.log(data);
              console.log(`get socketID(${data.id})'s candidate`);
              const pc: RTCPeerConnection = receivePCsRef.current[data.id];
              if (!(pc && data.candidate)) return;
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
              console.log(`socketID(${data.id})'s candidate add success`);
            } catch (error) {
              console.log(error);
            }
          };
          break;

        default:
          console.log('error');

          break;
      }
      return () => {
        if (socketRef.current) {
          // socketRef.current.disconnect();
        }
        if (sendPCRef.current) {
          sendPCRef.current.close();
        }
        users.forEach((user) => closeReceivePC(user.id));
      };
      // eslint-disable-next-line
    };
  }, [
    closeReceivePC,
    createReceivePC,
    createSenderOffer,
    createSenderPeerConnection,
    getLocalStream,
  ]);
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
      {users.map((user, index) => (
        <Video key={index} stream={user.stream} />
      ))}
    </div>
  );
};

export default userVideo;
