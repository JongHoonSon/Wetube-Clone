const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  
  if (text === "") {
    return ;
  }
  fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // express 에게 POST에 담긴 내용이 JSON 형태의 String 임을 headers에서 전달함
    },                                    // express야 이거 바꿔줘 ~ 근데 내가 미리 JSON 형태로 바꿔놨어~
    body: JSON.stringify({ text }),
  });
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}