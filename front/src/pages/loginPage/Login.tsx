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
  const [loginInfo, setLoginInfo] = useState({
    userId: '',
    userPassword: '',
  });
  const isLogin = useSelector((state: RootState) => state.isLogin.value);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginSubmit = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!loginInfo.userId) {
      return alert('아이디를 입력하세요.');
    } else if (!loginInfo.userPassword) {
      return alert('패스워드를 입력하세요.');
    }

    // 로그인
    axios
      .post(`${API}/users/login`, loginInfo, {
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
          dispatch(setLoginUsername(loginInfo.userId));

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
            value={loginInfo.userId}
            onChange={(e) => {
              setLoginInfo({
                ...loginInfo,
                userId: e.target.value,
              });
            }}
          />
          <input
            type='password'
            name='userPassword'
            placeholder='Password'
            value={loginInfo.userPassword}
            onChange={(e) => {
              setLoginInfo({
                ...loginInfo,
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
