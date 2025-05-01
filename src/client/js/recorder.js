const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

const handleStart = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
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

startBtn.addEventListener("click", handleStart);
