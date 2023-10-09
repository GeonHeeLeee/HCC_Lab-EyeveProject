import styles from '../../styles/mypage.module.css';

import { propsType } from './mypage.type';

import { sessionExpiration } from '../../store/modules/loginUserSlice';
import { logout } from '../../store/modules/isLoginSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/types/redux.type';

function MyPageNav({ handleCreateMeeting }: propsType) {
  const { networkInterface } = useSelector((state: RootState) => state.network);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogoutSubmit = (e: React.MouseEvent) => {
    e.preventDefault();

    networkInterface.signOut().then((res) => {
      localStorage.removeItem('userName');
      dispatch(sessionExpiration());
      dispatch(logout());
      alert('로그아웃');
      navigate('/');
    });
  };
  return (
    <>
      <nav
        className='navbar navbar-expand-md fixed-top'
        style={{ margin: ' 5px' }}>
        <img
          src='images/google-meet-icon.png'
          alt='logo'
          className={styles.logo}
        />
        <a href='#' className={`${styles.navbarBrand} text-dark`}>
          Eyeve
        </a>
        <div className='collapse navbar-collapse'>
          <ul className='navbar-nav' style={{ marginRight: 'auto' }}></ul>
          <ul className='navbar-nav' style={{ marginRight: '0' }}>
            <li className={`${styles.navItem} sign-in ${styles.displayCenter}`}>
              <a href='#' className='nav-link'>
                대시보드
              </a>
            </li>
            <li className={`${styles.navItem} sign-in ${styles.displayCenter}`}>
              <a href='#' className='nav-link' onClick={handleLogoutSubmit}>
                로그아웃
              </a>
            </li>

            <li className={`${styles.navItem}`}>
              <button
                className='btn btn-primary btn-lg text-light font-weight-bold '
                onClick={handleCreateMeeting}>
                수업 시작하기
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default MyPageNav;
