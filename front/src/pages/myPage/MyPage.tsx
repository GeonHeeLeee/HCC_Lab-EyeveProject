import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import API from '../../services/api';
import { io } from 'socket.io-client';
import {
  clearSocket,
  setSocket,
  socketSlice,
} from '../../store/modules/socketSlice';
import useInput from '../../hooks/useInput';
import { RootState } from '../../store/types/redux.type';

import { sessionExpiration } from '../../store/modules/loginUserSlice';
import { enterRoom } from '../../store/modules/loginUserSlice';
import MypageMain from './MyPageMain';
import MyPageNav from './MyPageNav';
import { getSocket, initSocket } from '../../services/socket';

/*
    useEffect 이용해서 페이지 이동할 때 세션 관리 (별도 파일로 관리하면 좋을듯)
*/

const initialForm = { meetingId: '' };

function MyPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [render, setRender] = useState(false);

  const loginUser = useSelector((state: RootState) => state.loginUser);

  const { networkInterface } = useSelector((state: RootState) => {
    return state.network;
  });
  const { socket } = useSelector((state: RootState) => {
    return state.socket;
  });

  // Cookie에 존재하는 SESSIONID 확인
  useEffect(() => {
    networkInterface
      .checkAuthentication()
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('userName');
          alert('접근 불가합니다.');
          navigate('/');
        } else if (res.status === 200) {
          setRender(true);
          return;
        }
      })
      .catch((error) => {
        localStorage.removeItem('userName');
        alert('접근 불가합니다.');
        console.error(error);
        navigate('/');
        return;
      });
  }, []);

  const handleCreateMeeting = () => {
    // const endpoint = 'http://localhost:8081'
    // const endpoint = process.env.REACT_APP_SERVER_API!;

    const socket = new WebSocket('ws://localhost:8081/socket');

    dispatch(setSocket(socket));

    // initSocket();

    // const socket = getSocket();

    if (socket) {
      socket.onopen = function () {
        socket.send(
          JSON.stringify({
            userId: loginUser.userId,
            messageType: 'CREATE',
          })
        );

        console.log('socket is send');
      };

      socket.onmessage = function (event) {
        let msg = JSON.parse(event.data);

        switch (msg.messageType) {
          case 'CREATE':
            console.log(msg.roomName);
            dispatch(enterRoom(msg.roomName));

            alert(msg.roomName);
            navigate('/meeting');
        }
      };

      socket.onerror = (error) => {
        console.log(error);
        socket.close();
      };

      socket.onclose = function (event) {
        console.log(event);
      };
    }
  };

  return (
    <>
      {render ? (
        <>
          <MyPageNav handleCreateMeeting={handleCreateMeeting}></MyPageNav>
          <MypageMain handleCreateMeeting={handleCreateMeeting}></MypageMain>
        </>
      ) : (
        <></>
      )}
      {/* <MyPageNav handleCreateMeeting={handleCreateMeeting}></MyPageNav>
      <MypageMain handleCreateMeeting={handleCreateMeeting}></MypageMain> */}
    </>
  );
}

export default MyPage;
