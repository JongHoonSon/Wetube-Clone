const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");

// console.log(video, play, mute, time, volume);

let volumeValue = 0.5;

video.volume = volumeValue;

const handlePlayClick = (event) => {
    if(video.paused) {
        video.play();
    } else {
        video.pause();
    }
    playBtn.innerText = video.paused ? "Play" : "Pause";
}

const handleMute = (event) => {
    if(video.muted) {
        video.muted = false;
    } else {
        video.muted = true;
    }
    muteBtn.innerText = video.muted ? "Unmute" : "Mute"
    volumeRange.value = video.muted ? 0 : volumeValue;
}

const handleVolumeChange = (event) => {
    const { target: { value } } = event;
    if (video.muted) {
        video.muted = false;
        muteBtn.innerText = "Mute";
    }
    volumeValue = value;
    video.volume = value;
}

const handleLoadedMetaData = (event) => {
    totalTime.innerText = Math.floor(video.duration);  // loadmetadata 를 다루는 핸들러 안에서만 사용 가능함.
}

const handleTimeUpdate = (event) => {
    currentTime.innerText = Math.floor(video.currentTime);
}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetaData)
video.addEventListener("timeupdate", handleTimeUpdate)