import React from 'react';
import styles from '../../styles/login.module.css';

import { useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { show } from '../../store/modules/showSignupSlice';
import { login, logout } from '../../store/modules/isLoginSlice';
import { setLoginUsername } from '../../store/modules/loginUsernameSlice';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:8080';

function Login() {
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.isLogin.value);
  const navigate = useNavigate();

  console.log(isLogin);
  const [loginState, setLoginState] = useState({
    userId: '',
    userPassword: '',
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (!loginState.userId) {
      return alert('아이디를 입력하세요.');
    } else if (!loginState.userPassword) {
      return alert('패스워드를 입력하세요.');
    }
    //로그인 처리

    /*
    
    1.axios 요청을 통해 서버로 입력받은 아이디와 패스워드 전송

    2.서버로부터 받은 상태코드에 따라 로그인 상태 변수 바꾸기

    3. 로그인 성공 시, 
      3-1. 로컬 스토리지에 받은 토큰 값 저장
      3-2. 토큰 마이페이지로 이동

    4. 페이지가 새로고침 시, 로컬 스토리지에 있는 토큰 값을 바탕으로 isLogin 값 갱신 (useEffect 사용)

    */

    axios
      .post(`${API}/users/login`, loginState, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res);

        if (res.status === 400) {
          // 로그인 실패

          return alert('로그인 실패.');
        } else if (res.state === 200) {
          // 로그인 성공

          // 헤더로부터 sessionId 가져오기
          let accessToken = res.headers['authorization'];

          console.log(accessToken);
          console.log('userName: ', res.data.userName);
          console.log('userId: ', res.data.userId);

          dispatch(login());
          dispatch(setLoginUsername(loginState.userId));

          // localstorage에 세선 아이디 저장
          localStorage.setItem('sessionId', accessToken);

          navigate('/mypage');

          return res;
        }
      })
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          console.log('error message: ', error.message);
          // navigate('/mypage'); 실험
          return alert('로그인 실패');
        } else {
          console.log('unexpected error: ', error);
          return alert('로그인 실패');
        }
      });
  };

  return (
    <div className={styles.loginBox}>
      <div className={styles.loginWrapper}>
        <h2>Eyeve</h2>
        <form className={styles.loginForm} method='post' action=''>
          <input
            type='text'
            name='userID'
            placeholder='ID'
            value={loginState.userId}
            // onChange={handleId}
            onChange={(e) => {
              setLoginState({
                ...loginState,
                userId: e.target.value,
              });

              console.log(loginState);
            }}
          />
          <input
            type='password'
            name='userPassword'
            placeholder='Password'
            value={loginState.userPassword}
            onChange={(e) => {
              setLoginState({
                ...loginState,
                userPassword: e.target.value,
              });

              console.log(loginState);
            }}
          />
          <input type='submit' value='Login' onClick={handleLoginSubmit} />
        </form>
        <h3
          onClick={() => {
            dispatch(show());
          }}>
          회원가입
        </h3>
      </div>
    </div>
  );
}

export default Login;
