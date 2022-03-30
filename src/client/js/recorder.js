const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

let stream;
let recorder;
let videoFile;

const handleDownload = async () => {

    const ffmpeg = createFFmpeg({
        log: true
    });
    await ffmpeg.load();

    ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));

    await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4"); // -i : encording, -r : frame 설정

    const mp4File = ffmpeg.FS("readFile", "output.mp4");

    console.log(mp4File);   // 실제 파일, 수정만 가능
    console.log(mp4File.buffer); // 실제 파일, raw data(binary data)이용 가능, 버퍼를 사용해야함

    const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });

    const mp4Url = URL.createObjectURL(mp4Blob);

    const a = document.createElement("a");
    a.href = mp4Url;
    a.download = "MyRecording.mp4";
    document.body.appendChild(a);
    a.click();
}

const handleStop = () => {
    startBtn.innerText = "Download recorded video";
    startBtn.removeEventListener("click", handleStop);
    startBtn.addEventListener("click", handleDownload);

    recorder.stop();
}

const handleStart = () => {
    startBtn.innerText = "Stop Recording";
    startBtn.removeEventListener("click", handleStart);
    startBtn.addEventListener("click", handleStop);

    recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.ondataavailable = (e) => {
        videoFile = URL.createObjectURL(e.data); // 녹화된 영상의 메모리 상에서의 위치를 가르키고 있는 URL
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
    }
    recorder.start();
}

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    });
    video.srcObject = stream;
    video.play();
}

init();

startBtn.addEventListener("click", handleStart);