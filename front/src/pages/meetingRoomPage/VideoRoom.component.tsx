import {useSelector} from "react-redux";
import {RootState} from "../../store/types/redux.type";

const VideoRoomComponent = () => {
  const {socket: mySocket} = useSelector((state: RootState) => state.socket);
  return (<>
    
  </>)
}

export default VideoRoomComponent;