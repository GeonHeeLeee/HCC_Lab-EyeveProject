import axios from 'axios';
import React, {useEffect, useState} from 'react';

import {useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';

import API from '../../services/api';
import {io} from "socket.io-client";
import {clearSocket, setSocket} from "../../store/modules/socketSlice";

/*
    useEffect 이용해서 페이지 이동할 때 세션 관리 (별도 파일로 관리하면 좋을듯)
*/

function MyPage() {
  const navigate = useNavigate();
  const [render, setRender] = useState(false);
  const [meetingId, setMeetingId] = useState('');
  const dispatch = useDispatch();

  const handleTyping = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMeetingId(event.target.value);
  }

  const handleEnterMeeting = (_: React.MouseEvent<HTMLButtonElement>) => {
    const socket = io();

    socket.on('connect', () => {

    });

    socket.on('disconnect', () => {
      console.log(socket.id);
    });

    socket.on('connect_error', (error) => {
      alert('미팅 참여에 실패하였습니다.');
      console.error(error);
      socket.close();
      dispatch(clearSocket({}));
    })
    dispatch(setSocket({socket}));
  }

  // Cookie에 존재하는 SESSIONID 확인
  useEffect(() => {
    async function checkUserAuth() {
      axios
          .get(`${API}/auto-login`, {
            withCredentials: true,
          })
          .then((res) => {
            console.log(res)
            if (res.status === 401) {
              localStorage.removeItem('userName');
              alert('접근 불가합니다.');
              navigate('/');
            } else if (res.status === 200) {
              setRender(true);
              localStorage.setItem('usernameName', res.data);
              console.log('response status: 200');
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
    }

    checkUserAuth();
  }, []);


  return <>
    {render && <div>안녕하세요 {localStorage.getItem('userName')}님</div>}
    <button>미팅 생성</button>
    <div>
      <input type='text' placeholder='Meet ID 입력하기' value={meetingId} onChange={handleTyping}/>
      <button onClick={handleEnterMeeting}>참가하기</button>
    </div>
  </>;
}

export default MyPage;
