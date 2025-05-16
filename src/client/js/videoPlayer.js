const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

// let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;
volumeRange.value = volumeValue;

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleKeydown = (event) => {
  const focusElement = document.activeElement;
  if (
    event.code === "Space" &&
    focusElement !== document.querySelector("textarea")
  ) {
    handlePlayClick();
    event.preventDefault();
  }
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
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (Number(value) !== 0) {
    video.muted = false;
    muteBtnIcon.classList = "fas fa-volume-up";
  } else {
    video.muted = true;
    muteBtnIcon.classList = "fas fa-volume-mute";
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
    fullScreenIcon.classList = "fas fa-compress";
  } else {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  }
};

const handleFullScreenChange = () => {
  fullScreenIcon.classList = document.fullscreenElement
    ? "fas fa-compress"
    : "fas fa-expand";
};

const handleWindowResize = () => {
  // F11 등 브라우저 전체화면 진입 시 창의 크기가 화면 크기와 동일하면 전체화면 모드로 간주
  if (
    window.innerHeight === screen.height &&
    window.innerWidth === screen.width
  ) {
    fullScreenIcon.classList = "fas fa-compress";
  } else {
    fullScreenIcon.classList = "fas fa-expand";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
  playBtnIcon.classList = "fas fa-play";
};

playBtn.addEventListener("click", handlePlayClick);
video.addEventListener("ended", handleEnded);
video.addEventListener("click", handlePlayClick);
document.addEventListener("keydown", handleKeydown);

muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);

video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimelineChange);
video.addEventListener("ended", handleEnded);

fullScreenBtn.addEventListener("click", handleFullScreen);
videoContainer.addEventListener("fullscreenchange", handleFullScreenChange);
window.addEventListener("resize", handleWindowResize);

videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", hideControls);
