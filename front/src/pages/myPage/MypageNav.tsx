import styles from '../../styles/mypage/mypage.module.css';

function MypageNav() {
  return (
    <>
      <nav
        className='navbar navbar-expand-md fixed-top'
        style={{ margin: '5px' }}>
        <img
          src='images/google-meet-icon.png'
          alt='logo'
          className={styles.logo}
        />
        <a href='#' className={`${styles.navbarBrand} text-dark`}>
          Eyeve
        </a>
        <div className={`collapse navbar-collapse`}>
          <ul className='navbar-nav' style={{ marginRight: 'auto' }}>
            <li className={`${styles.navItem} nav-item`}>
              <a href='#' className={`nav-link`}>
                At a glance
              </a>
            </li>
            <li className={`${styles.navItem} nav-item`}>
              <a href='#' className={`nav-link`}>
                How it works
              </a>
            </li>
            <li className={`${styles.navItem}`}>
              <a href='#' className={`nav-link`}>
                Plan and Price
              </a>
            </li>
          </ul>
          <ul className='navbar-nav' style={{ marginRight: '0' }}>
            <li className={`${styles.navItem} sign-in ${styles.displayCenter}`}>
              <a href='#' className='nav-link'>
                Sign in
              </a>
            </li>
            <li className={`${styles.navItem}`}>
              <button
                className={`btn btn-outline-secondary btn-lg text-info font-weight-bold`}>
                Join the meeting
              </button>
            </li>
            <li className={`${styles.navItem}`}>
              <button className='btn btn-info btn-lg text-light font-weight-bold new-meeting'>
                Start a meeting
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default MypageNav;
