import styles from '../../styles/mypage/mypage.module.css';

import KeyboardIcon from '@mui/icons-material/Keyboard';
import VideoCallIcon from '@mui/icons-material/VideoCall';

function MyPageMain() {
  return (
    <>
      <main>
        <div
          className={`${styles.jumbotron} h-100 d-flex`}
          style={{ marginTop: '5rem', paddingLeft: '2rem' }}>
          <div className='container w-50' style={{ padding: '0' }}>
            <h1 style={{ fontSize: '3rem' }}>
              Premium video meeting. Now it is available for free to everyone.
            </h1>
            <p style={{ fontSize: '20px' }}>
              We're redesigning the Google Meet service for secure business
              meetings and making it free for everyone to use.
            </p>
            <ul
              className={`${styles.displayCenter}`}
              style={{ padding: '0', paddingTop: '2rem' }}>
              <li
                style={{
                  listStyle: 'none',
                }}>
                <button
                  className={`btn btn-lg text-light font-weight-bold ${styles.displayCenter}`}
                  style={{ backgroundColor: '#01796b' }}>
                  <VideoCallIcon
                    style={{ marginRight: '1rem' }}></VideoCallIcon>
                  New Meeting
                </button>
              </li>
              <li style={{ paddingLeft: '3rem' }}>
                <button
                  className={`btn btn-lg btn-outline-secondary text-dark font-weight-bold ${styles.displayCenter}`}
                  style={{ backgroundColor: 'ffffff' }}>
                  <KeyboardIcon style={{ marginRight: '1rem' }}></KeyboardIcon>
                  <input
                    type='text'
                    placeholder='Enter a code'
                    style={{ border: 'none' }}
                    name=''
                    className=''
                  />
                </button>
              </li>
              <li
                className={`text-dark font-weight-bold ${styles.cursorPointer}`}
                style={{ paddingLeft: '1rem' }}>
                Join
              </li>
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

export default MyPageMain;
