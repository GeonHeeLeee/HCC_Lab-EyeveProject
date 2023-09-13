import React, {useState} from 'react';

import {useDispatch} from 'react-redux';

import axios from 'axios';

import {hide} from '../../store/modules/showSignupSlice';

import styles from '../../styles/login.module.css';

import API from '../../services/api';

// TODO: any 타입을 바꾸기
// 회원가입 정보 서버로 전송
async function sendSignup(userSignupData: any) {
  try {
    const {data, status} = await axios.post(`${API}/users`, userSignupData);

    if (status === 400) {
      return false;
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('error message: ', error.message);
      return false;
    } else {
      console.log('unexpected error: ', error);
      return false;
    }
  }
}

function Signup() {
  const dispatch = useDispatch();

  const [signupState, setSignupState] = useState({
    userName: '',
    userId: '',
    userPassword: '',
    userType: '',
  });

  const handleSignupSubmit = (event: React.MouseEvent) => {
    event.preventDefault();

    if (!signupState.userName) {
      return alert('이름을 입력하세요.');
    } else if (!signupState.userId) {
      return alert('아이디를 입력하세요.');
    } else if (!signupState.userPassword) {
      return alert('패스워드를 입력하세요.');
    } else if (!signupState.userType) {
      return alert('권한을 체크하세요.');
    }

    const data = sendSignup(signupState);

    data.then((res) => {
      console.log(res);
      if (res === false) {
        alert('회원가입 실패');
      } else {
        alert(
            `반갑습니다. ${signupState.userName} 님\n회원가입이 완료되었습니다. `
        );
        dispatch(hide());
      }
    });
  };

  return (
      <div className={styles.signUpBox}>
        <div className={styles.signUpWrapper}>
          <button
              className={styles.closeButton}
              onClick={() => {
                dispatch(hide());
              }}>
            ✖
          </button>
          <h2>회원가입</h2>
          <form className={styles.signupForm} action='' method='post'>
            <input
                type='text'
                name='userName'
                placeholder='Name'
                value={signupState.userName}
                onChange={(e) => {
                  setSignupState({
                    ...signupState,
                    userName: e.target.value,
                  });
                }}
            />
            <input
                type='text'
                name='userID'
                placeholder='ID'
                value={signupState.userId}
                onChange={(e) => {
                  setSignupState({
                    ...signupState,
                    userId: e.target.value,
                  });
                }}
            />
            <input
                type='password'
                name='userPassword'
                placeholder='Password'
                value={signupState.userPassword}
                onChange={(e) => {
                  setSignupState({
                    ...signupState,
                    userPassword: e.target.value,
                  });
                }}
            />
            <label>
              <input
                  type='radio'
                  name='termsAndConditions'
                  value='PROFESSOR'
                  onChange={(e) => {
                    setSignupState({
                      ...signupState,
                      userType: e.target.value,
                    });
                  }}
              />
              교수자
            </label>
            <label>
              <input
                  type='radio'
                  name='termsAndConditions'
                  value='STUDENT'
                  onChange={(e) => {
                    setSignupState({
                      ...signupState,
                      userType: e.target.value,
                    });
                  }}
              />
              학생
            </label>
            {/*<button type='submit' value='SignUp' onClick={handleSignupSubmit}>회원가입</button>*/}
            <input type='submit' value='SignUp' onClick={handleSignupSubmit} />

          </form>
        </div>
      </div>
  );
}

export default Signup;
