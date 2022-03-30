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
    await ffmpeg.load(); // 유저 사이드에서 ffmpeg가 load될 때까지 기다림

    ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));

    // webm -> mp4변환
    await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4"); // -i : encording, -r : frame 설정

    // webm 에서 thumbnail 찍음
    await ffmpeg.run("-i", "recording.webm", "-ss", "00:00:01", "-frames:v", "1", "thumbnail.jpg");  // "-ss", "00:00:01" -> 영상의 00:00:01 시간에
                                                                                    // "-frames:v", "1" -> 1장의 사진을 찍음
    console.log();

    const mp4File = ffmpeg.FS("readFile", "output.mp4");
    const thumbFile = ffmpeg.FS("readFile", "thumbnail.jpg");

    // console.log(mp4File);   // 실제 파일, 수정만 가능
    // console.log(mp4File.buffer); // 실제 파일, raw data(binary data)이용 가능, 버퍼를 사용해야함

    // binary data 로 Blob 생성
    const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
    const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

    const mp4Url = URL.createObjectURL(mp4Blob);
    const thumbUrl = URL.createObjectURL(thumbBlob);

    const a = document.createElement("a");
    a.href = mp4Url;
    a.download = "MyRecording.mp4";
    document.body.appendChild(a);
    a.click();

    const thumbA = document.createElement("a");
    thumbA.href = thumbUrl;
    thumbA.download = "MyThumbnail.jpg";
    document.body.appendChild(thumbA);
    thumbA.click();

    // 작업이 끝났으므로 해당 파일, URL을 삭제하여 브라우저가 빨리 동작할 수 있도록 함.
    // 메모리 관리 차원

    ffmpeg.FS("unlink", "recording.webm");
    ffmpeg.FS("unlink", "output.mp4");
    ffmpeg.FS("unlink", "thumbnail.mp4");

    URL.revokeObjectURL(videoFile);
    URL.revokeObjectURL(mp4Url);
    URL.revokeObjectURL(thumbUrl);
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