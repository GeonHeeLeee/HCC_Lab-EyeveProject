import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import axios from 'axios';
import {hide} from '../../store/modules/showSignupSlice';
import API from '../../services/api';

import styles from '../../styles/login.module.css';
import Button from "../../components/common/Button";

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

const initialState = {
  userName: '',
  userId: '',
  userPassword: '',
  userType: '',
};

function Signup() {
  const dispatch = useDispatch();

  const [signupInfo, setSignupInfo] = useState(initialState);

  const handleSignupSubmit = (event: React.MouseEvent) => {
    event.preventDefault();

    if (!signupInfo.userName) {
      return alert('이름을 입력하세요.');
    } else if (!signupInfo.userId) {
      return alert('아이디를 입력하세요.');
    } else if (!signupInfo.userPassword) {
      return alert('패스워드를 입력하세요.');
    } else if (!signupInfo.userType) {
      return alert('권한을 체크하세요.');
    }

    const data = sendSignup(signupInfo);

    data.then((res) => {
      if (res === false) {
        alert('회원가입 실패');
      } else {
        alert(
            `반갑습니다. ${signupInfo.userName} 님\n회원가입이 완료되었습니다. `
        );
        dispatch(hide());
      }
    });
  };

  return (
      <div className={styles.signUpBox}>
        <div className={styles.signUpWrapper}>
          <Button
              className={styles.closeButton}
              onClick={() => {
                dispatch(hide());
              }}>
            ✖
          </Button>
          <h2>회원가입</h2>
          <form className={styles.signupForm} action='' method='post'>
            <input
                type='text'
                name='userName'
                placeholder='Name'
                value={signupInfo.userName}
                onChange={(e) => {
                  setSignupInfo({
                    ...signupInfo,
                    userName: e.target.value,
                  });
                }}
            />
            <input
                type='text'
                name='userID'
                placeholder='ID'
                value={signupInfo.userId}
                onChange={(e) => {
                  setSignupInfo({
                    ...signupInfo,
                    userId: e.target.value,
                  });
                }}
            />
            <input
                type='password'
                name='userPassword'
                placeholder='Password'
                value={signupInfo.userPassword}
                onChange={(e) => {
                  setSignupInfo({
                    ...signupInfo,
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
                    setSignupInfo({
                      ...signupInfo,
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
                    setSignupInfo({
                      ...signupInfo,
                      userType: e.target.value,
                    });
                  }}
              />
              학생
            </label>
            {/*<button type='submit' value='SignUp' onClick={handleSignupSubmit}>회원가입</button>*/}
            <input type='submit' value='SignUp' onClick={handleSignupSubmit}/>

          </form>
        </div>
      </div>
  );
}

export default Signup;
