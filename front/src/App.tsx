import './App.css';

import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/loginPage/LoginPage';

import MyPage from './pages/myPage/MyPage';
import MeetingRoom from './pages/meetingRoomPage/MeetingRoom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserVideo from './pages/meetingRoomPage/UserVideo';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<LoginPage />}></Route>
        <Route path='/mypage' element={<MyPage></MyPage>}></Route>
        <Route path='/meeting' element={<UserVideo />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
