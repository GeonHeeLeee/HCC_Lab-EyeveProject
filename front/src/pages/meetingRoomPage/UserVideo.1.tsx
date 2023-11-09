import { useEffect, useState, useRef, useCallback } from 'react';
import { WebRTCUser } from './rtc.type';
import Video from '../../components/meetingRoom/video/video';
import { getSocket, initSocket } from '../../services/socket';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types/redux.type';
import { pc_config } from './UserVideo';

export const UserVideo = () => {
  const dispatch = useDispatch();

  const loginUser = useSelector((state: RootState) => state.loginUser);

  const socketRef = useRef<WebSocket | null>(); // 서버와 통신할 소켓
  const localStreamRef = useRef<MediaStream>();

  const sendPCRef = useRef<RTCPeerConnection>();
  const receivePCsRef = useRef<{ [userId: string]: RTCPeerConnection }>({});

  const localVideoRef = useRef<HTMLVideoElement>(null); // 자신의 MediaStream 출력할 video 태그의 ref

  // const remoteVideoRef = useRef<HTMLVideoElement>(null); // 상대방의 MediaStream 출력할 video 태그의 ref
  const [users, setUsers] = useState<Array<WebRTCUser>>([]);

  const createReceiverOffer = useCallback(
    async (pc: RTCPeerConnection, senderUsertID: string) => {
      try {
        const sdp = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        console.log('create receiver offer success');
        await pc.setLocalDescription(new RTCSessionDescription(sdp));

        if (!socketRef.current) return;
        socketRef.current.send(
          JSON.stringify({
            sdp,
            messageType: 'SDP_OFFER',
          })
        );
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

        pc.onicecandidate = (e) => {
          if (!(e.candidate && socketRef.current)) return;
          console.log('receiver PC onice candidate');
          // console.log(e.candidate.candidate);
          if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(
              JSON.stringify({
                messageType: 'ICE_CANDIDATE_RECEIVER',
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
          // 새로운 유저가 들어왔을 때, 방에 있는 유저들에 대한 PeerConnection 생성
          case 'ALL_USERS':
            (data: { users: Array<{ userId: string }> }) => {
              data.users.forEach((user) => {
                createReceivePC(user.userId);
              });
            };
            break;

          case 'USER_ENTER':
            createReceivePC(data.userId);
            break;

          case 'getReceiverAnswer':
            (async (data: { userId: string; sdp: RTCSessionDescription }) => {
              try {
                console.log(`get user(${data.userId}) answer`);
                const pc: RTCPeerConnection =
                  receivePCsRef.current[data.userId];
                if (!pc) return;
                await pc.setRemoteDescription(data.sdp);
                console.log(`userId ${data.userId} set remote sdp success`);
              } catch (error) {
                console.log(error);
              }
            })(data);
            break;

          case 'getReceiverCandidata':
            (async (data: {
              userId: string;
              candidate: RTCIceCandidateInit;
            }) => {
              try {
                console.log(data);
                console.log(`get user(${data.userId}) candidate`);
                const pc: RTCPeerConnection =
                  receivePCsRef.current[data.userId];
                if (!pc) return;

                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                console.log(`userId ${data.userId} add candidate success`);
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
        if (sendPCRef.current) {
          sendPCRef.current.close();
        }
      };
    }
  }, [getLocalStream, createSenderOffer, createSenderPeerConnection]);
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
