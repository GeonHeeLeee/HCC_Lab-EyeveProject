import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store/types/redux.type";
import {isJson} from "../api/checker/jsonChecker";
import {SocketMessage} from "../pages/myPage/types";
import {setSocket} from "../store/modules/socketSlice";
import {useNavigate} from "react-router-dom";

const useEnterMeeting = () => {
  const navigate = useNavigate();
  const {userId} = useSelector((state: RootState) => state.loginUserInfo);
  const dispatch = useDispatch();
  const handleEnterMeeting = (meetingId: string) => () => {
    const socket = new WebSocket('ws://localhost:8081/socket');
    console.log(meetingId)
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({
        roomName: meetingId,
        messageType: 'JOIN',
        userId
      }));
      console.log('socket send')

    });

    socket.addEventListener('message', (event) => {
      const {data} = event;
      console.log(data);
      let socketMsg: string | SocketMessage<'JOIN'> = !isJson(data) ? data : JSON.parse(data);
      if (typeof socketMsg === 'string') {
        console.log(socketMsg);
      } else {
        navigate(`/meeting?meetingId=${meetingId}`);
      }
    });

    dispatch(setSocket({socket}))
  }

  return [handleEnterMeeting] as const;
}

export default useEnterMeeting;