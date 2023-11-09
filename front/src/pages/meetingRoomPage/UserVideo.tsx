import { useEffect, useState, useRef, useCallback } from 'react';

import { WebRTCUser } from './rtc.type';

import Video from '../../components/meetingRoom/video/video';
import { getSocket, initSocket } from '../../services/socket';
// import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types/redux.type';
import { login } from '../../store/modules/isLoginSlice';

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
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

const UserVideo = () => {
  // const dispatch = useDispatch();

  const loginUser = useSelector((state: RootState) => state.loginUser);

  const socketRef = useRef<WebSocket | null>(); // 서버와 통신할 소켓
  const localStreamRef = useRef<MediaStream>();

  const sendPCRef = useRef<RTCPeerConnection>();
  const receivePCsRef = useRef<{ [userId: string]: RTCPeerConnection }>({});

  const localVideoRef = useRef<HTMLVideoElement>(null); // 자신의 MediaStream 출력할 video 태그의 ref
  // const remoteVideoRef = useRef<HTMLVideoElement>(null); // 상대방의 MediaStream 출력할 video 태그의 ref
  const [users, setUsers] = useState<Array<WebRTCUser>>([]);

  const createReceiverOffer = useCallback(
    async (pc: RTCPeerConnection, senderId: string) => {
      try {
        const sdp = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        console.log('create receiver offer success');
        await pc.setLocalDescription(new RTCSessionDescription(sdp));

        if (!socketRef.current) return;

        console.log('send receiver offer');

        socketRef.current.send(
          JSON.stringify({
            messageType: 'RECEIVER_SDP_OFFER', // TODO: 서버와 이벤트명 어떻게 할 지 정의
            userId: loginUser.userId, // TODO: 보낸 사람의 userId 를 보내주어야 하는 것인지 정의
            receiverId: senderId,
            roomName: loginUser.roomName,
            sdpOffer: sdp.sdp, // 오류 발생 가능
          })
        );
        console.log('send receiver offer success');
      } catch (error) {
        console.log(error);
      }
    },
    []
  );

  const createReceiverPeerConnection = useCallback(
    (userId: string): RTCPeerConnection | undefined => {
      try {
        const pc = new RTCPeerConnection(pc_config);

        receivePCsRef.current = { ...receivePCsRef.current, [userId]: pc };

        console.log(receivePCsRef.current);

        pc.onicecandidate = (e) => {
          if (!(e.candidate && socketRef.current)) return;
          console.log('receiver PC onicecandidate');
          // console.log(e.candidate.candidate);
          if (socketRef.current.readyState === WebSocket.OPEN) {
            console.log(loginUser.userId, userId);

            socketRef.current.send(
              JSON.stringify({
                messageType: 'ICE_CANDIDATE',
                iceCandidate: e.candidate,
                userId: loginUser.userId,
                receiverId: userId,
                roomName: loginUser.roomName,
              })
            );
          }
        };

        pc.oniceconnectionstatechange = (e) => {
          console.log(e);
        };

        pc.ontrack = (e) => {
          console.log('ontrack success');
          setUsers((oldUsers) =>
            oldUsers
              .filter((user) => user.userId !== userId)
              .concat({ userId: userId, stream: e.streams[0] })
          );
        };

        return pc;
      } catch (error) {
        console.log(error);
        return undefined;
      }
    },
    []
  );

  const createReceivePC = useCallback(
    (userId: string) => {
      try {
        console.log(`${userId} user enter`);
        const pc = createReceiverPeerConnection(userId);
        console.log(pc);

        if (!(socketRef.current && pc)) return;
        createReceiverOffer(pc, userId);
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
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      console.log('create sender offer success');
      await sendPCRef.current.setLocalDescription(
        new RTCSessionDescription(sdp)
      );

      if (!socketRef.current) return;

      // console.log(socketRef.current);

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
            receiverId: null,
            roomName: loginUser.roomName,
          })
        );
      }
    };

    pc.oniceconnectionstatechange = (e) => {
      console.log(e);
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
            (async (data: {
              candidate: RTCIceCandidateInit;
              userId: string;
              receiverId: string | null;
            }) => {
              //TODO: 서버에서 보내주는 candidate 의 userId 가 null 인지 아닌지에 따라 분기
              if (data.receiverId === null) {
                // data.userId 가 null 이면
                // sendPC에 대한 candidate 추가
                try {
                  // console.log(data);

                  if (!(data.candidate && sendPCRef.current)) return;
                  console.log('get sender candidate');
                  await sendPCRef.current.addIceCandidate(
                    new RTCIceCandidate(data.candidate)
                  );
                  console.log('candidate add success');
                } catch (error) {
                  console.log(error);
                }
              } else {
                // data.userId 가 null 이 아니면
                // receivePCsRef.current[data.userId] 에 대한 candidate 추가
                try {
                  console.log(data);
                  console.log(`get user(${data.receiverId}) candidate`);
                  const pc: RTCPeerConnection =
                    receivePCsRef.current[data.receiverId];
                  if (!pc) return;

                  await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                  console.log(
                    `userId ${data.receiverId} add candidate success`
                  );
                } catch (error) {
                  console.log(error);
                }
              }
            })(data);
            break;

          // 새로운 유저가 들어왔을 때, 방에 있는 유저들에 대한 PeerConnection 생성
          case 'USERS_IN_ROOM':
            console.log('get all users');

            ((data: { users: Array<{ userId: string }> }) => {
              data.users.forEach((user) => {
                console.log(user);

                createReceivePC(user.userId);
              });
            })(data);
            break;

          case 'USER_ENTER':
            createReceivePC(data.userId);
            break;

          case 'RECEIVER_SDP_ANSWER':
            (async (data: {
              receiverId: string;
              SDP_ANSWER: RTCSessionDescription;
            }) => {
              try {
                console.log(`get user(${data.receiverId}) answer`);
                const pc: RTCPeerConnection =
                  receivePCsRef.current[data.receiverId];
                if (!pc) return;
                await pc.setRemoteDescription(data.SDP_ANSWER); // TODO: 서버에서 보내주는 sdp 이름이 맞는 지 확인
                console.log(`userId ${data.receiverId} set remote sdp success`);
              } catch (error) {
                console.log(error);
              }
            })(data);
            break;

          // TODO: 이벤트명 서버와 정의
          // case 'RECEIVER_ICE_CANDIDATE':
          //   (async (data: {
          //     receiverId: string;
          //     candidate: RTCIceCandidateInit;
          //   }) => {
          //     try {
          //       console.log(data);
          //       console.log(`get user(${data.receiverId}) candidate`);
          //       const pc: RTCPeerConnection =
          //         receivePCsRef.current[data.receiverId];
          //       if (!pc) return;

          //       await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          //       console.log(`userId ${data.receiverId} add candidate succes s`);
          //     } catch (error) {
          //       console.log(error);
          //     }
          //   })(data);
          //   break;

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
  }, [
    getLocalStream,
    createSenderOffer,
    createSenderPeerConnection,
    createReceivePC,
  ]);
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
      {/* <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: 'black',
        }}
        muted
        ref={remoteVideoRef}
        autoPlay
      /> */}

      {users.map((user, index) => (
        <Video key={index} stream={user.stream} />
      ))}
    </div>
  );
};

export default UserVideo;
