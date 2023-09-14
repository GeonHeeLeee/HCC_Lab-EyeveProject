import {useSelector} from "react-redux";
import {RootState} from "../../store/types/redux.type";
import Timeline from "../../components/meetingRoom/timeline/Timeline.component";
import Chat from "../../components/meetingRoom/chat/Chat.componenet";
import FileShare from "../../components/meetingRoom/fileShare/FileShare.component";

const MeetingRoom = () => {
  const {socket: mySocket} = useSelector((state: RootState) => state.socket);

  return (
      <main>
        <section>
          <section>
            {/* TODO: 파일 보여주기 영역 */}
          </section>
          <section>
            {/* TODO: Video 영역 */}
          </section>
          <Timeline/>
        </section>
        <section>
          {/* TODO: 교수자 비디오 */}
          <Chat/>
          <FileShare/>
        </section>
      </main>
  )
}

export default MeetingRoom;