import styles from '../../styles/mypage.module.css';
import '../../styles/bootstrap.css';

import VideoCallIcon from '@mui/icons-material/VideoCall';
import KeyboardIcon from '@mui/icons-material/Keyboard';

import { propsType } from './mypage.type';

function MypageMain({
  handleEnterMeeting,
  handleCreateMeeting,
  meetingId,
  onChange,
}: propsType) {
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
                  회의 시작하기
                </button>
              </li>
              <li style={{ paddingLeft: '3rem' }}>
                <button
                  className={`btn btn-lg btn-outline-secondary text-dark font-weight-bold ${styles.displayCenter}`}
                  style={{ backgroundColor: 'ffffff' }}>
                  <KeyboardIcon style={{ marginRight: '1rem' }}></KeyboardIcon>
                  <input
                    type='text'
                    placeholder='회의 코드 입력'
                    style={{ border: 'none' }}
                    name=''
                    className=''
                  />
                </button>
              </li>
              <button
                className={`text-dark font-weight-bold ${styles.cursorPointer}`}
                style={{ paddingLeft: '1rem' }}
                onClick={handleEnterMeeting}>
                참여
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
