const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");

let volumeValue = 0.5;
video.volume = volumeValue;
// volumeRange.value = volumeValue;

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "Play" : "Pause";
};

const handleMuteClick = (e) => {
  if (video.muted) {
    if (Number(volumeValue) === 0) {
      volumeValue = 0.5;
      video.muted = false;
    }
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.innerText = video.muted ? "Unmute" : "Mute";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (Number(value) !== 0) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  } else {
    video.muted = true;
    muteBtn.innerText = "Unmute";
  }
  volumeValue = value;
  video.volume = value;
};

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(video.duration);
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(video.currentTime);
  timeline.value = Math.floor(video.currentTime);
};

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    // 시간이 있을 때는 "HH:MM:SS" 형태로 표시
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  } else {
    // 한 시간이 안되는 경우 "MM:SS" 형태로 표시
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  if (!fullscreen) {
    videoContainer.requestFullscreen();
    fullScreenBtn.innerText = "Exit Full Screen";
  } else {
    document.exitFullscreen();
    fullScreenBtn.innerText = "Full Screen";
  }
};

const handleFullScreenChange = () => {
  fullScreenBtn.innerText = document.fullscreenElement ? "Exit Full Screen" : "Full Screen";
};

const handleWindowResize = () => {
  // F11 등 브라우저 전체화면 진입 시 창의 크기가 화면 크기와 동일하면 전체화면 모드로 간주
  if (window.innerHeight === screen.height && window.innerWidth === screen.width) {
    fullScreenBtn.innerText = "Exit Full Screen";
  } else {
    fullScreenBtn.innerText = "Full Screen";
  }
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", () => (playBtn.innerText = "Play"));
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
videoContainer.addEventListener("fullscreenchange", handleFullScreenChange);

window.addEventListener("resize", handleWindowResize);
