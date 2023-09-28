import styles from '../../styles/mypage.module.css';
import '../../styles/bootstrap.css';

import VideoCallIcon from '@mui/icons-material/VideoCall';
import KeyboardIcon from '@mui/icons-material/Keyboard';

import useInput from '../../hooks/useInput';

import { propsType } from './mypage.type';

const initialForm = { meetingId: '' };

function MypageMain({ handleEnterMeeting, handleCreateMeeting }: propsType) {
  const [form, onChange] = useInput(initialForm);

  return (
    <>
      <main>
        <div
          className={`${styles.jumbotron} h-100 d-flex`}
          style={{ marginTop: '9rem', paddingLeft: '2rem' }}>
          <div className='container w-50' style={{ padding: '0' }}>
            <h1 style={{ fontSize: '3rem' }}>
              모든 사용자를 위한 영상 통화 및 화상 회의
            </h1>
            <p style={{ fontSize: '20px' }}>
              실시간 온라인교육에서 학습몰입과 참여를 강화하기 위한 AI 알고리즘
              기반 맞춤형 피드백 시스템
            </p>
            <ul
              className={`${styles.displayCenter}`}
              style={{ padding: '0', paddingTop: '2rem' }}>
              <li
                style={{
                  listStyle: 'none',
                }}>
                <button
                  className={`btn btn-primary btn-lg text-light font-weight-bold ${styles.displayCenter}`}
                  onClick={handleCreateMeeting}>
                  <VideoCallIcon
                    style={{ marginRight: '1rem' }}></VideoCallIcon>
                  수업 시작하기
                </button>
              </li>
              <li style={{ paddingLeft: '3rem' }}>
                <button
                  className={`btn btn-lg btn-outline-secondary text-dark font-weight-bold ${styles.displayCenter}`}
                  style={{ backgroundColor: 'ffffff' }}>
                  <KeyboardIcon style={{ marginRight: '1rem' }}></KeyboardIcon>
                  <input
                    type='text'
                    placeholder='강의실 코드 입력'
                    style={{ border: 'none' }}
                    name='meetingId'
                    className=''
                    onChange={onChange}
                  />
                </button>
              </li>
              <button
                className={`btn btn-primary btn-lg text-light font-weight-bold ${styles.displayCenter}`}
                style={{ marginLeft: '0.5rem' }}
                onClick={handleEnterMeeting}>
                참가
              </button>
            </ul>
          </div>
          <div className='container w-50'>
            <img
              src='images/google-meet-people.jpg'
              className={styles.signinImage}
              alt=''
            />
          </div>
        </div>
      </main>
    </>
  );
}

export default MypageMain;
