import { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';

import { useNavigate } from 'react-router-dom';

import axios from 'axios';

import Login from './Login';
import Signup from './Signup';
import API from '../../services/api';

function LoginPage() {
  const navigate = useNavigate();

  const [render, setRender] = useState(false); // 로그인 상태 유지 시, 로그인 페이지 잠깐이라도 보이지 않도록

  // Cookie에 존재하는 SESSIONID 확인 후 mypage로 이동
  useEffect(() => {
    async function checkUserAuth() {
      axios
        .get(`${API}/auto-login`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.status === 200) {
            localStorage.setItem('usernameName', res.data);
            console.log('response status: 200');
            navigate('/mypage');
            return;
          }
        })
        .catch((error) => {
          localStorage.removeItem('userName'); // 401 에러 시 localStorage에 존재하는 userName 초기화
          setRender(true);
          return;
        });
    }
    checkUserAuth();
  }, []);

  const showSignup = useSelector((state) => state.showSignup.value);

  return (
    render && (
      <div>
        <Login />
        {showSignup && <Signup />}
      </div>
    )
  );
}
export default LoginPage;
