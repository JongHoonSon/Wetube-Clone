import "../scss/styles.scss"
import regeneratorRuntime from "regenerator-runtime";

const uploadDate = document.getElementById("uploadDate");

const createDate = uploadDate.dataset.id;
const nowDate = new Date().toISOString();

const createYear = Number(createDate.slice(0, 4));
const nowYear = Number(nowDate.slice(0, 4));

const createMonth = Number(createDate.slice(5,7));
const nowMonth = Number(nowDate.slice(5,7));

const createDay = Number(createDate.slice(8,10));
const nowDay = Number(nowDate.slice(8,10));

let text = '';

if(nowYear > createYear) {
    text = nowYear - createYear + "년 전";
} else if(nowMonth > createMonth) {
    console.log("nowMonth", nowMonth);
    console.log("createMonth", createMonth);
    text = nowMonth - createMonth + "달 전";
} else {
    console.log("nowDay", nowDay);
    console.log("createDay", createDay);
    if(nowDay - createDay === 0) {
        text = "오늘";
    } else {
        text = nowDay - createDay + "일 전";
    }
}

uploadDate.innerText = text;