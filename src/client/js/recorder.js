import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const init = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { width: 200, height: 100 },
    });
    video.srcObject = stream;
    video.play();

    // stream 이 준비된 뒤에만 녹화 시작 리스너를 붙인다
    actionBtn.addEventListener("click", handleStart);
  } catch (err) {
    console.error("getUserMedia 실패:", err);
    alert("카메라 권한이 필요합니다.");
  }
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);

  actionBtn.innerText = "Transcoding...";

  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({
    corePath: "/convert/ffmpeg-core.js",
    log: true,
  });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

  await ffmpeg.run("-i", files.input, "-r", "60", files.output);

  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
};

const handleStop = () => {
  // stops recording
  actionBtn.innerText = "Download Recording";
  actionBtn.removeEventListener("click", handleStop);
  actionBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleStart = () => {
  // starts recording
  actionBtn.innerText = "Stop Recording";
  actionBtn.removeEventListener("click", handleStart);
  actionBtn.addEventListener("click", handleStop);

  recorder = new window.MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    // console.log(event.data);
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

init();

actionBtn.addEventListener("click", handleStart);
