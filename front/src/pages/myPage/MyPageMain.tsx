import styles from '../../styles/mypage.module.css';

function MypageMain() {
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
          </div>
        </div>
      </main>
    </>
  );
}

export default MypageMain;
