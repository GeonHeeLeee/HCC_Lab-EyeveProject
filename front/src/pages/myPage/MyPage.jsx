import axios from 'axios';
import React, { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import API from '../../services/api';

/*
    useEffect 이용해서 페이지 이동할 때 세션 관리 (별도 파일로 관리하면 좋을듯)
*/

function MyPage() {
  // usename localStorage에 저장
  // const loginUsername = useSelector((state) => state.loginUsername.username);
  const navigate = useNavigate();
  const [render, isRender] = useState(false);

  // Cookie에 존재하는 SESSIONID 확인
  useEffect(() => {
    async function checkUserAuth() {
      axios
        .get(`${API}/auto-login`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.status === 401) {
            localStorage.removeItem('userName');
            alert('접근 불가합니다.');
            navigate('/');
          } else if (res.status === 200) {
            isRender(true);
            localStorage.setItem('usernameName', res.data);
            console.log('response status: 200');
            return;
          }
        })
        .catch((error) => {
          localStorage.removeItem('userName');
          alert('접근 불가합니다.');
          navigate('/');
          return;
        });
    }
    checkUserAuth();
  }, []);
  return render && <div>안녕하세요 {localStorage.getItem('userName')}님</div>;
}

export default MyPage;
