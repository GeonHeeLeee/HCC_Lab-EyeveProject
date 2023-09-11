import axios from 'axios';
import React, { useEffect } from 'react';

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import API from '../../services/api';

/*
    useEffect 이용해서 페이지 이동할 때 세션 관리 (별도 파일로 관리하면 좋을듯)
*/

function MyPage() {
  const loginUsername = useSelector((state) => state.loginUsername.username);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUserAuth() {
      axios
        .get(`${API}/auto-login`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.status === 401) {
            alert('접근 불가합니다.');
            navigate('/');
          } else if (res.status === 200) {
            localStorage.setItem('usernameName', res.data);
            console.log('response status: 200');
            return;
          }
        })
        .catch((error) => {
          alert('접근 불가합니다.');
          navigate('/');
          return;
        });
    }
    checkUserAuth();
  });
  return <div>안녕하세요 {localStorage.getItem('userName')}님</div>;
}

export default MyPage;
