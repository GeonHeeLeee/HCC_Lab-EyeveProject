import React from 'react';
import {useState, useEffect} from 'react';

import {useSelector, useDispatch} from 'react-redux';

import {useNavigate} from 'react-router-dom';

import axios from 'axios';

import Login from './Login';
import Signup from './Signup';
import API from '../../services/api';
import {RootState} from "../../store/types/redux.type";

/*

1. 회원가입 
  유효성 검사

  유저가 입력한 값 state에 저장하고 있다가
  서버에게 아이디 비번 이름 보내줌

  **교수자인지 학인지 고를 수  있도록 추가


2. 로그인 
  유저가 타이핑 하는 값 state로 저장

  axios 요청해서 회원정보 존재하는지 확인

  회원정보 존재하지 않으면 팝업창 발생
    서버에게 POST GET 요청하여 정보 확인
*/

function LoginPage() {

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
        render && (
        <div>
          <Login/>
          {showSignup && <Signup/>}
        </div>
        )
      </>
  );
}

export default LoginPage;
