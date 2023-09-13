import './App.css';

import {Route, Routes} from 'react-router-dom';

import LoginPage from './pages/loginPage/LoginPage';

import MyPage from './pages/myPage/MyPage';

function App() {

  return (
      <>
        <Routes>
          <Route path='/' element={<LoginPage/>}/>
          {/* <Route
        path='/mypage'
        element={<PrivateRoute component={<MyPage />}></PrivateRoute>}></Route> */}
          <Route path='/mypage' element={<MyPage/>}/>
        </Routes>
        {/* <LoginPage></LoginPage>*/}
      </>
  );
}

export default App;
