import styles from '../../styles/mypage.module.css';

function MyPageNav() {
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
              <a href='#' className='nav-link'>
                로그아웃
              </a>
            </li>
            <li className={`${styles.navItem}`}>
              <button
                className={`btn btn-outline-secondary btn-lg text-primary font-weight-bold`}>
                회의 참여하기
              </button>
            </li>
            <li className={`${styles.navItem}`}>
              <button className='btn btn-primary btn-lg text-light font-weight-bold '>
                회의 시작하기
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default MyPageNav;
