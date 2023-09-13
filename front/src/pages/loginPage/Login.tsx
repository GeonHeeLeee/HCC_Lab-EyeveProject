import React from 'react';
import styles from '../../styles/login.module.css';

import { useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { show } from '../../store/modules/showSignupSlice';
import { login } from '../../store/modules/isLoginSlice';
import { setLoginUsername } from '../../store/modules/loginUsernameSlice';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

import API from '../../services/api';
import {RootState} from "../../store/types/redux.type";

function Login() {
  const dispatch = useDispatch();
  const isLogin = useSelector((state: RootState) => state.isLogin.value);
  const navigate = useNavigate();

  console.log(isLogin);

  // 사용자 input 받아오는 state
  const [loginState, setLoginState] = useState({
    userId: '',
    userPassword: '',
  });

  const handleLoginSubmit = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!loginState.userId) {
      return alert('아이디를 입력하세요.');
    } else if (!loginState.userPassword) {
      return alert('패스워드를 입력하세요.');
    }

    // 로그인
    axios
      .post(`${API}/users/login`, loginState, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res);

        if (res.status === 400) {
          // 로그인 실패
          return alert('로그인 실패.');
        } else if (res.status === 200) {
          // 로그인 성공
          localStorage.setItem('userName', res.data); // 로그인 성공 시, localStorage에 userName 저장

          console.log('userName: ', res.data.userName);
          console.log('userId: ', res.data.userId);

          dispatch(login());
          dispatch(setLoginUsername(loginState.userId));

          alert(`안녕하세요 ${localStorage.getItem('userName')}님`);

          navigate('/mypage'); // mypage로 navigate

          return res;
        }
      })
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          console.log('error message: ', error.message);

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
            onChange={(e) => {
              setLoginState({
                ...loginState,
                userId: e.target.value,
              });
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
            }}
          />
          {/*<input type='submit' value='Login' onClick={handleLoginSubmit} />*/}
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
