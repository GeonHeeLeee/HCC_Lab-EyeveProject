import React from 'react';
import { useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useNavigate } from 'react-router-dom';

import axios from 'axios';

import Login from './Login';
import Signup from './Signup';
import API from '../../services/api';
import { RootState } from '../../store/types/redux.type';

function LoginPage() {
  const loginUser = useSelector((state: RootState) => state.loginUser);

  const navigate = useNavigate();

  const [render, setRender] = useState(false);

  // Cookie에 존재하는 SESSIONID 확인 후 mypage로 이동
  useEffect(() => {
    async function checkUserAuth() {
      axios
        .get(`${API}/auto-login`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.status === 401) {
            return;
          } else if (res.status === 200) {
            localStorage.setItem('usernameName', res.data);
            console.log('response status: 200');

            navigate('/mypage');
            return;
          }
        })
        .catch((error) => {
          // 401 에러 시 localStorage에 존재하는 userName 초기화
          localStorage.removeItem('userName');
          setRender(true);
          return;
        });
    }

    checkUserAuth();
  }, []);

  const showSignup = useSelector((state: RootState) => state.showSignup.value);

  return (
    <>
      {render && (
        <div>
          <Login />
          {showSignup && <Signup />}
        </div>
      )}
    </>
  );
}

export default LoginPage;
