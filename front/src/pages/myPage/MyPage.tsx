import axios from 'axios';
import React, {useEffect, useState} from 'react';

import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';

import {clearSocket, setSocket, socketSlice} from "../../store/modules/socketSlice";
import useInput from "../../hooks/useInput";
import {RootState} from "../../store/types/redux.type";
import VideoScreenComponent from "../../components/meetingRoom/video/VideoScreen.component";
import {SocketMessage} from "./types";
import {isJson} from '../../api/checker/jsonChecker'

/*
    useEffect 이용해서 페이지 이동할 때 세션 관리 (별도 파일로 관리하면 좋을듯)
    https://developer.mozilla.org/ko/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications
    https://doublem.org/webrtc-story-02/
*/

const initialForm = {meetingId: ''};

function MyPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, onChange] = useInput(initialForm);
  const {networkInterface} = useSelector((state: RootState) => state.network);
  const {userId} = useSelector((state: RootState) => state.loginUserInfo);

  const handleEnterMeeting = (_: React.MouseEvent<HTMLButtonElement>) => {
    const socket = new WebSocket('ws://localhost:8081/socket');

    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({
        userId: userId,
        messageType: 'JOIN',
        roomName: form.meetingId,
      }));
    })
    socket.addEventListener('message', (event) => {
      const socketMsg = event.data;
      if (!isJson(socketMsg)) {
        const data = socketMsg;
        console.log(data);
        return;
      }
      const data: SocketMessage<'JOIN'> = JSON.parse(event.data);
      console.log(data);

      const {messageType} = data;
      if (messageType === "JOIN") {
        navigate(`/meeting?meetingId=${form.meetingId}`);
      }
    })

    // socket.on('disconnect', () => {
    //   console.log(socket.id);
    // });
    //
    // socket.on('connect_error', (error) => {
    //   alert('미팅 참여에 실패하였습니다.');
    //   console.error(error);
    //   socket.close();
    //   dispatch(clearSocket({}));
    // })
    dispatch(setSocket({socket}));
  }

  // Cookie에 존재하는 SESSIONID 확인
  useEffect(() => {
    async function checkUserAuth() {
      networkInterface.checkAuthentication()
          .catch((error) => {
            localStorage.removeItem('userName');
            alert('접근 불가합니다.');
            console.error(error);
            navigate('/');
          });
    }

    checkUserAuth();
  }, []);

  const handleCreateMeeting = () => {
    const endpoint = process.env.REACT_APP_SERVER_API !;
    const socket = new WebSocket('ws://localhost:8081/socket');
    socket.onopen = function () {
      socket.send(JSON.stringify({
        userId: userId,
        messageType: 'CREATE',
      }));
      console.log('socket is send');
    }

    socket.addEventListener('message', (event) => {
      const socketMsg = event.data;
      console.log(socketMsg);
      if (!isJson(socketMsg)) {
        const data = socketMsg;
        console.log(data);
        return;
      }
      const data: SocketMessage<'CREATE'> = JSON.parse(socketMsg);
      console.log(data)
      const {roomName, messageType} = data;
      if (messageType !== 'CREATE') return;
      console.log(roomName)
      navigate(`/meeting?meetingId=${roomName}`);
    })

    let i = 0;
    socket.onerror = (error) => {
      console.log(error);
      if (i == 2) {
        socket.close();
        dispatch(clearSocket({}));
      }
      i++;
    }

    socket.onclose = function () {

    }

    dispatch(setSocket({socket}));
  };

  return <>
    <div>안녕하세요 {localStorage.getItem('userName')}님</div>
    <button onClick={handleCreateMeeting}>미팅 생성</button>
    <div>
      <input type='text' placeholder='Meet ID을 입력해주세요' value={form.meetingId} name='meetingId' onChange={onChange}/>
      <button onClick={handleEnterMeeting}>참가하기</button>
    </div>
    {/*  Test 용*/}
    {/*<VideoScreenComponent/>*/}
    <button onClick={() => {
      networkInterface.signOut().then(() => {
        navigate('/')
      });
    }}>
      로그아웃
    </button>
  </>;
}

export default MyPage;
