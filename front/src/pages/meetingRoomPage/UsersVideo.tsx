import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/types/redux.type';

import Video from '../../components/meetingRoom/video/video';

import { WebRTCUser } from './rtc.type';
import { getSocket, initSocket } from '../../services/socket';

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

const UsersVideo = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((state: RootState) => state.socket);

  const socketRef = useRef<WebSocket | null>(); // 서버와 통신할 소켓
  const localStreamRef = useRef<MediaStream>();
  const sendPCRef = useRef<RTCPeerConnection>(); // 자신의 MediaStream 서버에게 전송할 RTCPeerConnection

  // 같은 방에 참가한 다른 user들의 MediaStream을 서버에서 전송받을 RTCPeerConnetion 목록
  // receivePCs[socket id] = pc 형식 (추후 수정)
  const receivePCsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
  const [users, setUsers] = useState<Array<WebRTCUser>>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null); // 자신의 MediaStream 출력할 video 태그의 ref

  const closeReceivePC = useCallback((id: string) => {
    if (!receivePCsRef.current[id]) return;
    receivePCsRef.current[id].close();
    delete receivePCsRef.current[id];
  }, []);

  // senderSocketID user의 MediaStream을 전송받을 RTCPeerConnection의 offer를 생성
  // RTCSessionDescription을 해당 RTCPeerConnection의 localDescription에 지정
  // RTCSessionDescription을 소켓을 통해 서버로 전송
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

  // socketID user의 MediaStream을 받기 위한 RTCPeerConnection 생성
  // receivePCs 변수에 key-value 형식으로 생성한 RTCPeerConnection 저장
  // 생성된 RTCPeerConnection 반환
  const createReceiverPeerConnection = useCallback((socketID: string) => {
    try {
      const pc = new RTCPeerConnection(pc_config);

      receivePCsRef.current = { ...receivePCsRef.current, [socketID]: pc };

      // offer 또는 answer signal을 생성한 후부터 본인의 RTCIceCandidate 정보 이벤트가 발생
      // 본인의 RTCIceCandidate 정보를 Socket을 통해 서버로 전송
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

      // ICE connection 상태가 변경되었을 때의 log
      pc.oniceconnectionstatechange = (e) => {
        console.log(e);
      };

      // 상대방의 RTCSessionDescription을 본인의 RTCPeerConnection에서의 remoteSessionDescription으로 지정하면 상대방의 track 데이터에 대한 이벤트가 발생
      // users 변수에 stream 등록
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

  // room에 참가하는 다른 user들의 MediaStream을 받을 RTCPeerConnection을 생성하고 서버에 offer 전송
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

  // 자신의 MediaStream을 서버에게 보낼 RTCPeerConnection의 offer를 생성
  // RTCSessionDescription을 해당 RTCPeerConnection의 localDescription에 지정
  // RTCSessionDescription을 소켓을 통해서 서버로 전송
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

  // 자신의 MediaStream을 서버로 보내기 위한 RTCPeerConnection을 생성하고 localStream을 등록
  // 생성된 RTCPeerConnection 반환
  const createSenderPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(pc_config);

    // offer 또는 answer signal을 생성한 후부터 본인의 RTCIceCandidate 정보 이벤트가 발생
    // 본인의 RTCIceCandidate 정보를 Socket을 통해 서버로 전송
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

    // ICE connection 상태가 변경됐을 때의 log
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
    initSocket();
    socketRef.current = getSocket();
    console.log(socketRef.current);

    getLocalStream();

    if (socketRef.current) {
      socketRef.current.onmessage = function (e) {
        let data = JSON.parse(e.data);

        switch (data.messageType) {
          case 'userEnter': // 해당 user의 MediaStream을 받을 RTCPeerConnection을 생성하고 서버로 offer 보냄
            createReceivePC(data.id);
            break;

          case 'allUsers': // 해당 user들의 MediaStream을 받을 RTCPeerConnection을 생성하고 서버로 offer 보냄
            data.users.forEach((user: any) => createReceivePC(user.id));
            break;

          case 'userExit': // 해당 userdml MediaStream을 받기 위해 연결한 RTCPeerConnetion을 닫고, 목록에서 삭제
            closeReceivePC(data.id);
            setUsers((users) => users.filter((user) => user.id !== data.id));
            break;

          case 'getSenderAnswer': // 해당 RTCPeerConnection의 remoteDescription으로 sdp를 지정
            // TODO: 소켓을 통해 받아온 데이터명 확인해서 data 변수 바꿔주기
            (async (data: { sdp: RTCSessionDescription }) => {
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
            })(data);
            break;

          case 'getSenderCandidate': // 해당 RTCPeerConnection에 RTCIceCandidate 추가
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

          case 'getReceiverAnswer': // 해당 RTCPeerConnection의 remoteDescription으로 sdp 지정
            (async (data: { id: string; sdp: RTCSessionDescription }) => {
              try {
                console.log(`get socketID(${data.id}'s answer)`);
                const pc: RTCPeerConnection = receivePCsRef.current[data.id];
                if (!pc) return;
                await pc.setRemoteDescription(data.sdp);
                console.log(`socketID(${data.id})'s set remote sdp success`);
              } catch (error) {
                console.log(error);
              }
            })(data);
            break;

          case 'getReceiverCandidate': // 해당 RTCPeerConnection에 RTCIceCandidate 추가
            (async (data: { id: string; candidate: RTCIceCandidateInit }) => {
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
            })(data);
            break;

          default:
            console.log('error');

            break;
        }
      };
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
    }
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

export default UsersVideo;
