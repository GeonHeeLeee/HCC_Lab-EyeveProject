import React from 'react';
import styles from '../../styles/login.module.css';

import { useSelector, useDispatch } from 'react-redux';
import { show } from '../../store/modules/showSignupSlice';
import { login } from '../../store/modules/isLoginSlice';
import { setLoginUser } from '../../store/modules/loginUserSlice';

import { useNavigate } from 'react-router-dom';

import { RootState } from '../../store/types/redux.type';
import useInput from '../../hooks/useInput';

const initialState = {
  userId: '',
  userPassword: '',
};

function Login() {
  const [loginInfo, setLoginInfo] = useInput(initialState);

  const loginUser = useSelector((state: RootState) => state.loginUser);

  const isLogin = useSelector((state: RootState) => state.isLogin.value);
  const { networkInterface } = useSelector((state: RootState) => state.network);
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
    networkInterface
      .signIn(loginInfo)
      .then((res) => {
        if (res.status !== 200) return;

        console.log(res.data);

        localStorage.setItem('userName', res.data.userName);
        dispatch(login());
        dispatch(setLoginUser(res.data));
        console.log(loginUser);
        alert(`안녕하세요 ${localStorage.getItem('userName')}님`);
        navigate('/mypage'); // mypage로 navigate
      })
      .catch((error) => {
        console.error(`Login Error: ${error.message}`);
        alert('로그인 실패');
      });
  };

  return (
    <div className={styles.loginBox}>
      <div className={styles.loginWrapper}>
        <h2>Eyeve</h2>
        <form className={styles.loginForm} method='post' action=''>
          <input
            type='text'
            name='userId'
            placeholder='Id'
            value={loginInfo.userId}
            onChange={setLoginInfo}
          />
          <input
            type='password'
            name='userPassword'
            placeholder='Password'
            value={loginInfo.userPassword}
            onChange={setLoginInfo}
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
