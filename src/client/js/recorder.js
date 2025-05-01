const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;

const handleDownload = () => {};

const handleStop = () => {
  // stops recording
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleStart = () => {
  // starts recording
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);
  recorder = new window.MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    // console.log(event.data);
    const videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 200,
      height: 100,
    },
  });
  // console.log(stream);
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener("click", handleStart);
