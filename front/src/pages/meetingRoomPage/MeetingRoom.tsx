// import {useSelector} from "react-redux";
// import {RootState} from "../../store/types/redux.type";
import Timeline from '../../components/meetingRoom/timeline/Timeline.component';
import Chat from '../../components/meetingRoom/chat/Chat.componenet';
import FileShare from '../../components/meetingRoom/fileShare/FileShare.component';
import styles from '../../styles/mypage.module.css';

import UsersVideo from './UserVideo';

import '../../styles/meetingRoom.module.css';

const MeetingRoom = () => {
  // const {socket: mySocket} = useSelector((state: RootState) => state.socket);

  return (
    <main>
      <section>
        <section>{/* TODO: 공유된 파일 보여주기 영역 */}</section>
        <section className={styles.usersVideo}>
          {/* TODO: Video 영역 */}
          <UsersVideo />
          {/* <video></video> */}
        </section>
        <Timeline />
      </section>
      <section>
        {/* TODO: 교수자 비디오 */}
        <Chat />
        <FileShare />
      </section>
    </main>
  );
};

export default MeetingRoom;
