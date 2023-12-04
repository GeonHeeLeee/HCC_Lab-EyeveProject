import { useEffect, useState, useRef, useCallback } from 'react';

import { WebRTCUser } from './rtc.type';

import Video from '../../components/meetingRoom/video/video';
import { getSocket, initSocket, closeSocket } from '../../services/socket';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types/redux.type';

import FileShare from '../../components/meetingRoom/fileShare/FileShare.component';

import styles from '../../styles/meetingRoom.module.css';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/common/Button';
import Chat from '../../components/meetingRoom/chat/Chat.componenet';
import { useDispatch } from 'react-redux';
import { leaveRoomAction } from '../../store/modules/loginUserSlice';

const pc_config = {
  iceServers: [
    // {
    //   urls: 'stun:[STUN_IP]:[PORT]',
    //   'credentials': '[YOR CREDENTIALS]',
    //   'username': '[USERNAME]'
    // },
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
      ],
    },
  ],
};

// TODO: 사용자가 방 퇴장했을 때 로직 구현
//        Peer 연결할 때 오류 발생 시, log 만 찍는 것이 아니라 방 퇴장 처리 로직 구현

const UserVideo = () => {
  const loginUser = useSelector((state: RootState) => state.loginUser);

  const socketRef = useRef<WebSocket | null>(); // 서버와 통신할 소켓
  const socket = useSelector((state: RootState) => state.socket.socket);
  console.log(socket);

  socketRef.current = socket;

  const localStreamRef = useRef<MediaStream>();

  const sendPCRef = useRef<RTCPeerConnection>();
  const receivePCsRef = useRef<{ [userId: string]: RTCPeerConnection }>({});

  const localVideoRef = useRef<HTMLVideoElement>(null); // 자신의 MediaStream 출력할 video 태그의 ref

  const [users, setUsers] = useState<Array<WebRTCUser>>([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const closeReiceivePC = useCallback((userId: string) => {
    if (!receivePCsRef.current[userId]) return;
    receivePCsRef.current[userId].close();
    delete receivePCsRef.current[userId];
  }, []);

  const leaveRoom = () => {
    console.log('leave room');

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(function (track) {
        track.stop();
      });
    }

    socketRef.current?.send(
      JSON.stringify({
        messageType: 'LEAVE',
        roomName: loginUser.roomName,
        userId: loginUser.userId,
      })
    );
    dispatch(leaveRoomAction());
    // useEffect에서 unmount 시 동작
    // if (socketRef.current) {
    //   closeSocket();
    // }
    // if (sendPCRef.current) {
    //   sendPCRef.current.close();
    // }
    // users.forEach((user) => closeReiceivePC(user.userId));
    navigate('/mypage');
  };

  // 원격 Peer의 stream 받아오기 위한 pc 객체에 대한 Offer 생성 후 서버에 전송
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

        socketRef.current.send(
          JSON.stringify({
            messageType: 'RECEIVER_SDP_OFFER',
            userId: loginUser.userId,
            receiverId: senderId,
            roomName: loginUser.roomName,
            sdpOffer: sdp.sdp,
          })
        );
        console.log('send receiver offer success');
      } catch (error) {
        console.log(error);
      }
    },
    []
  );

  // 원격 Peer의 stream 받아오기 위한  pc 객체 생성
  // ice events 등록
  const createReceiverPeerConnection = useCallback(
    (userId: string): RTCPeerConnection | undefined => {
      try {
        const pc = new RTCPeerConnection(pc_config);

        receivePCsRef.current = { ...receivePCsRef.current, [userId]: pc };

        pc.onicecandidate = (e) => {
          if (!(e.candidate && socketRef.current)) return;
          console.log('receiver PC onicecandidate');

          if (socketRef.current.readyState === WebSocket.OPEN) {
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

  // 원격 Peer의 stream 받아오기 위한  pc 객체 생성 과정
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

  // 자신의 stream 전송을 위한 PC의 Offer 생성 후 서버에 전송
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

  // 자신의 stream 전송을 위한 PC 생성
  // ice events 등록
  const createSenderPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(pc_config);

    pc.onicecandidate = (e) => {
      if (!(e.candidate && socketRef.current)) return;
      console.log('sender PC onicecandidate');

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
          width: 280,
          height: 180,
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

  // 브라우저 나갔을 때
  window.onbeforeunload = () => {
    socketRef.current?.send(
      JSON.stringify({
        messageType: 'LEAVE',
        roomName: loginUser.roomName,
        userId: loginUser.userId,
      })
    );
    dispatch(leaveRoomAction());
    leaveRoom();
  };

  useEffect(() => {
    console.log(socketRef.current);

    getLocalStream();

    if (socketRef.current) {
      socketRef.current.onmessage = function (e) {
        let data = JSON.parse(e.data);

        switch (data.messageType) {
          //SDP Answer를 받았을 때 서버로부터 받은 SDP Answer 저장
          case 'SDP_ANSWER':
            (async (data: {
              messageType: string;
              SDP_ANSWER: string;
              userId: string;
            }) => {
              try {
                if (!sendPCRef.current) return;
                console.log('get sender answer');

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

          // ICE Candidate를 받았을 때 서버로부터 받은 ICE Candidate 저장
          case 'ICE_CANDIDATE':
            (async (data: {
              candidate: RTCIceCandidateInit;
              userId: string;
              receiverId: string | null;
            }) => {
              if (data.receiverId === null) {
                // data.userId 가 null 이면
                // sendPC에 대한 candidate 추가
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

            ((data: { users: Array<string> }) => {
              data.users
                .filter((user) => user !== loginUser.userId)
                .forEach((user) => {
                  console.log(user);
                  createReceivePC(user);
                });
            })(data);
            break;

          // 유저가 방에서 나갔을 때, 다른 유저들에게 나간 유저에 대한 userId 를 전달받아 PeerConnection 종료
          case 'LEAVE':
            console.log('user exit');
            closeReiceivePC(data.userId);
            setUsers((oldUsers) =>
              oldUsers.filter((user) => user.userId !== data.userId)
            );
            break;

          // 새로운 유저가 들어왔을 때, 방에 있는 유저들이 새로운 유저에 대한 PeerConnection 생성
          case 'USER_ENTER':
            createReceivePC(data.userId);
            break;

          // 원격 Peer의 SDP Answer를 받았을 때 서버로부터 받은 SDP Answer 저장
          case 'RECEIVER_SDP_ANSWER':
            (async (data: { receiverId: string; SDP_ANSWER: string }) => {
              try {
                console.log(`get user(${data.receiverId}) answer`);
                const pc: RTCPeerConnection =
                  receivePCsRef.current[data.receiverId];
                if (!pc) return;
                await pc.setRemoteDescription({
                  type: 'answer',
                  sdp: data.SDP_ANSWER,
                });
                console.log(`userId ${data.receiverId} set remote sdp success`);
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
          closeSocket();
        }
        if (sendPCRef.current) {
          sendPCRef.current.close();
        }
        users.forEach((user) => closeReiceivePC(user.userId));

        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, [
    closeReiceivePC,
    getLocalStream,
    createSenderOffer,
    createSenderPeerConnection,
    createReceivePC,
  ]);

  // return (
  // <main>
  //   <div>
  //     <div>
  //       <FileShare />
  //     </div>
  //     <div className={styles.videoContainer}>
  //       <div className={styles.localVideo}>
  //         <video
  //           style={{
  //             width: 240,
  //             height: 240,
  //             backgroundColor: 'black',
  //           }}
  //           muted
  //           ref={localVideoRef}
  //           autoPlay
  //         />
  //       </div>

  //       <div className={styles.receiverVideo}>
  //         {users.map(
  //           (user, index) => (
  //             console.log(user.stream),
  //             (<Video videoKey={index} stream={user.stream} />)
  //           )
  //         )}
  //       </div>
  //     </div>
  //     <div>
  //       {/* 오른쪽 여러 상태 창 */}
  //       <button onClick={leaveRoom}>방 나가기</button>
  //     </div>
  //   </div>
  //   <div>{/* 하단 바 */}</div>
  // </main>
  // );

  return (
    <main>
      <div className={styles['meetingroom-div']}>
        <div className={styles['screen-sharing']}>
          <FileShare />
        </div>
        <div className={styles['videos-container']}>
          {users.map((user, index) => (
            <Video videoKey={index} stream={user.stream} />
          ))}
        </div>
        <div className={styles['info']}>
          <div className={styles['professor-video-container']}>
            <video
              className={styles['professor-video']}
              muted
              ref={localVideoRef}
              autoPlay
            />
          </div>
          <div className={styles['learning-activity']}></div>
          <div className={styles['alarm']}>
            <Button onClick={leaveRoom} children={'방 나가기 '} />
            <button onClick={leaveRoom}>방 나가기</button>
          </div>
          <div className={styles['chat-container']}>
            {/* <Chat roomId={loginUser.roomName} userId={loginUser.userId} /> */}
          </div>
        </div>
      </div>
      <div className={styles['timeline']}>{/* 타임라인 */}</div>
    </main>
  );
};

export default UserVideo;
