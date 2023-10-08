import axios from 'axios';
import React, { useEffect, useState } from 'react';

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

import { sessionExpiration } from '../../store/modules/loginUsernameSlice';
import { logout } from '../../store/modules/isLoginSlice';
import MypageMain from './MyPageMain';
import MyPageNav from './MyPageNav';

/*
    useEffect 이용해서 페이지 이동할 때 세션 관리 (별도 파일로 관리하면 좋을듯)
*/

const initialForm = { meetingId: '' };

function MyPage() {
  const navigate = useNavigate();
  const [render, setRender] = useState(false);

  const { networkInterface } = useSelector((state: RootState) => state.network);

  // Cookie에 존재하는 SESSIONID 확인
  // useEffect(() => {
  //   async function checkUserAuth() {
  //     axios
  //       .get(`${API}/auto-login`, {
  //         withCredentials: true,
  //       })
  //       .then((res) => {
  //         console.log(res);
  //         if (res.status === 401) {
  //           localStorage.removeItem('userName');
  //           alert('접근 불가합니다.');
  //           navigate('/');
  //         } else if (res.status === 200) {
  //           setRender(true);
  //           localStorage.setItem('usernameName', res.data);
  //           console.log('response status: 200');
  //           return;
  //         }
  //       })
  //       .catch((error) => {
  //         localStorage.removeItem('userName');
  //         alert('접근 불가합니다.');
  //         console.error(error);
  //         navigate('/');
  //         return;
  //       });
  //   }

  //   checkUserAuth();
  // }, []);

  const handleCreateMeeting = () => {
    // const endpoint = 'http://localhost:8081'
    const endpoint = process.env.REACT_APP_SERVER_API!;
    const socket = new WebSocket('ws://localhost:8081/socket');
    socket.onopen = function () {
      socket.send(
        JSON.stringify({
          userId: localStorage.getItem('userName'), // 임시: localStorage 에서 가져오기
          messageType: 'CREATE',
        })
      );
      console.log('socket is send');
    };

    socket.onmessage = function (event) {
      console.log(event.data, event);
    };

    let i = 0;
    socket.onerror = (error) => {
      console.log(error);
      if (i == 2) {
        socket.close();
      }
      i++;
    };

    socket.onclose = function (event) {
      console.log(event);
    };
  };

  return (
    <>
      <MyPageNav handleCreateMeeting={handleCreateMeeting}></MyPageNav>
      <MypageMain handleCreateMeeting={handleCreateMeeting}></MypageMain>
    </>
  );
}

export default MyPage;
