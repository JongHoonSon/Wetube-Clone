const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

let stream;
let recorder;
let videoFile;

const files = {
    input: "recording.webm",
    output: "output.mp4",
    thumb: "thumbnail.jpg"
}

const downloadFile = (fileUrl, fileName) => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
}

const handleDownload = async () => {
    actionBtn.innerText = "Transcording...";
    actionBtn.removeEventListener("click", handleDownload);
    actionBtn.disabled = true;

    const ffmpeg = createFFmpeg({
        log: true
    });
    await ffmpeg.load(); // 유저 사이드에서 ffmpeg가 load될 때까지 기다림

    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

    // webm -> mp4변환
    await ffmpeg.run("-i", files.input, "-r", "60", files.output); // -i : encording, -r : frame 설정

    // webm 에서 thumbnail 찍음
    await ffmpeg.run("-i", files.input, "-ss", "00:00:01", "-frames:v", "1", files.thumb);  // "-ss", "00:00:01" -> 영상의 00:00:01 시간에
                                                                                    // "-frames:v", "1" -> 1장의 사진을 찍음
    console.log();

    const mp4File = ffmpeg.FS("readFile", files.output);
    const thumbFile = ffmpeg.FS("readFile", files.thumb);

    // console.log(mp4File);   // 실제 파일, 수정만 가능
    // console.log(mp4File.buffer); // 실제 파일, raw data(binary data)이용 가능, 버퍼를 사용해야함

    // binary data 로 Blob 생성
    const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
    const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

    const mp4Url = URL.createObjectURL(mp4Blob);
    const thumbUrl = URL.createObjectURL(thumbBlob);

    downloadFile(mp4Url, "MyRecording.mp4");
    downloadFile(thumbUrl, "MyThumbnail.jpg");

    // 작업이 끝났으므로 해당 파일, URL을 삭제하여 브라우저가 빨리 동작할 수 있도록 함.
    // 메모리 관>리 차원

    ffmpeg.FS("unlink", files.input);
    ffmpeg.FS("unlink", files.output);
    ffmpeg.FS("unlink", files.thumb);

    URL.revokeObjectURL(videoFile);
    URL.revokeObjectURL(mp4Url);
    URL.revokeObjectURL(thumbUrl);

    actionBtn.disabled = false;
    actionBtn.innerText = "Recording Again";
    actionBtn.addEventListener("click", handleStart);
}

const handleStart = () => {
    actionBtn.innerText = "Recording";
    actionBtn.disabled = true;
    actionBtn.removeEventListener("click", handleStart);

    recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.ondataavailable = (e) => {
        videoFile = URL.createObjectURL(e.data); // 녹화된 영상의 메모리 상에서의 위치를 가르키고 있는 URL
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
        actionBtn.innerText = "Download";
        actionBtn.disabled = false;
        actionBtn.addEventListener("click", handleDownload);
    };
    recorder.start();
    setTimeout(() => {
        recorder.stop();
    }, 5000);
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

actionBtn.addEventListener("click", handleStart);