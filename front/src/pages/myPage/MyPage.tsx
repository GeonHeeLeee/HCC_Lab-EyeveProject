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
  const dispatch = useDispatch();
  const [form, onChange] = useInput(initialForm);
  const { networkInterface } = useSelector((state: RootState) => state.network);

  const handleEnterMeeting = (_: React.MouseEvent<HTMLButtonElement>) => {
    // const socket = io();
    const socket = new WebSocket('ws://localhost:8081/socket');

    socket.onopen = function () {
      socket.send(
        JSON.stringify({
          roomName: '', // TODO: roomName Input 에서 받아오기
          userId: 'aaa', // TODO: 바꿔야 함
          messageType: 'JOIN',
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
    // socket.on('connect', () => {});

    // socket.on('disconnect', () => {
    //   console.log(socket.id);
    // });

    // socket.on('connect_error', (error) => {
    //   alert('미팅 참여에 실패하였습니다.');
    //   console.error(error);
    //   socket.close();
    //   dispatch(clearSocket({}));
    // });
    // dispatch(setSocket({ socket }));
  };

  // Cookie에 존재하는 SESSIONID 확인
  // useEffect(() => {
  //   async function checkUserAuth() {
  //     axios
  //         .get(`${API}/auto-login`, {
  //           withCredentials: true,
  //         })
  //         .then((res) => {
  //           console.log(res)
  //           if (res.status === 401) {
  //             localStorage.removeItem('userName');
  //             alert('접근 불가합니다.');
  //             navigate('/');
  //           } else if (res.status === 200) {
  //             setRender(true);
  //             localStorage.setItem('usernameName', res.data);
  //             console.log('response status: 200');
  //             return;
  //           }
  //         })
  //         .catch((error) => {
  //           localStorage.removeItem('userName');
  //           alert('접근 불가합니다.');
  //           console.error(error);
  //           navigate('/');
  //           return;
  //         });
  //   }

  //   checkUserAuth();
  // }, []);

  const handleLogoutSubmit = (e: React.MouseEvent) => {
    e.preventDefault();

    networkInterface.signOut().then((res) => {
      localStorage.removeItem('userName');
      dispatch(sessionExpiration());
      dispatch(logout());
      alert('로그아웃');
      navigate('/');
    });
  };

  const handleCreateMeeting = () => {
    // const endpoint = 'http://localhost:8081'
    const endpoint = process.env.REACT_APP_SERVER_API!;
    const socket = new WebSocket('ws://localhost:8081/socket');
    socket.onopen = function () {
      socket.send(
        JSON.stringify({
          userId: 'aaa', // TODO: 바꿔야 함
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
      {/* props 설정해주기 */}
      <MyPageNav
        handleEnterMeeting={handleEnterMeeting}
        handleCreateMeeting={handleCreateMeeting}></MyPageNav>
      <MypageMain
        handleEnterMeeting={handleEnterMeeting}
        handleCreateMeeting={handleCreateMeeting}
        meetingId={form.meetingId}></MypageMain>
      {render && <div>안녕하세요 {localStorage.getItem('userName')}님</div>}
      <button onClick={handleCreateMeeting}>미팅 생성</button>
      <div>
        <input
          type='text'
          placeholder='Meet ID을 입력해주세요'
          value={form.meetingId}
          name='meetingId'
          onChange={onChange}
        />
        <button onClick={handleEnterMeeting}>참가하기</button>
      </div>
    </>
  );
}

export default MyPage;
