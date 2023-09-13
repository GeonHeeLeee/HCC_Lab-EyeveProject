import logo from './logo.svg';
import './App.css';

import { Route, Routes } from 'react-router-dom';

import LoginPage from './pages/loginPage/LoginPage';

import MyPage from './pages/myPage/MyPage';

function App() {
  return (
    <Routes>
      <Route path='/' element={<LoginPage />}></Route>
      <Route path='/mypage' element={<MyPage></MyPage>}></Route>
    </Routes>
  );
}

export default App;
