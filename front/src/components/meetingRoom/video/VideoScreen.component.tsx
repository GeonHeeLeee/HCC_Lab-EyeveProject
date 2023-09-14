// TODO: Separate Me or Other
const VideoScreenComponent = () => {
  return (
      <article>
        <video autoPlay={true} muted={true}/>
        <audio
            autoPlay
            muted
            controls
            style={{display: "none"}}
        />
      </article>
  )
}

export default VideoScreenComponent;