import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/types/redux.type';
import { hide } from '../../store/modules/showSignupSlice';
import styles from '../../styles/login.module.css';
import Button from '../../components/common/Button';

type UserSignupData = {
  userId: string;
  userPassword: string;
  userName: string;
  userType: 'STUDENT' | 'PROFESSOR' | undefined;
};

const initialState: UserSignupData = {
  userName: '',
  userId: '',
  userPassword: '',
  userType: undefined,
};

function Signup() {
  const dispatch = useDispatch();

  const [signupInfo, setSignupInfo] = useState(initialState);

  const { networkInterface } = useSelector((state: RootState) => state.network);

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

    networkInterface
      .signUp(signupInfo)
      .then((res) => {
        console.log(res);

        if (res.status === 400) {
          return;
        } else {
          alert(
            `반갑습니다. ${signupInfo.userName} 님\n회원가입이 완료되었습니다. `
          );
          dispatch(hide());
        }
      })
      .catch((error) => {
        if (error.response.status === 400) {
          return alert('회원가입 실패');
        }
        console.log(error);
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
                  userType: 'PROFESSOR',
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
                  userType: 'STUDENT',
                });
              }}
            />
            학생
          </label>
          <input type='submit' value='SignUp' onClick={handleSignupSubmit} />
        </form>
      </div>
    </div>
  );
}

export default Signup;
