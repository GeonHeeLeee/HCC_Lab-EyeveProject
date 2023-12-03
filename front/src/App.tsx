import './App.css';

import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/loginPage/LoginPage';

import MyPage from './pages/myPage/MyPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserVideo from './pages/meetingRoomPage/UserVideo';
import DashBoardContainer from './pages/dashboard/DashboardContainer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/mypage' element={<MyPage />} />
        <Route path='/meeting' element={<UserVideo />} />
        <Route path='/dashboard' element={<DashBoardContainer />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
