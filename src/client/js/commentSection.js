const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const commentDeleteBtns = document.querySelectorAll(
  ".video__comment__delete-btn"
);

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const div1 = document.createElement("div");
  const icon1 = document.createElement("i");
  icon1.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = `${text}`;
  const div2 = document.createElement("div");
  const deleteBtn = document.createElement("button");
  const icon2 = document.createElement("i");
  icon2.className = "fa-solid fa-xmark";

  console.log(id);

  newComment.appendChild(div1);
  div1.appendChild(icon1);
  div1.appendChild(span);

  newComment.appendChild(div2);
  div2.appendChild(deleteBtn);
  deleteBtn.appendChild(icon2);

  newComment.addEventListener("click", handleDeleteComment);

  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;

  if (text === "") {
    return;
  }
  const response = await fetch(`/api/comments/${videoId}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // express 에게 POST에 담긴 내용이 JSON 형태의 String 임을 headers에서 전달함
    }, // express야 이거 바꿔줘 ~ 근데 내가 미리 JSON 형태로 바꿔놨어~
    body: JSON.stringify({ text }),
  });

  if (response.status === 201) {
    // response 에서 json object 추출
    const { newCommentId } = await response.json();
    textarea.value = "";
    addComment(text, newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

const handleDeleteComment = async (event) => {
  const comment = event.target.parentElement.parentElement.parentElement;
  const commentId = comment.dataset.id;

  const response = await fetch(`/api/comments/${commentId}/delete`, {
    method: "DELETE",
  });

  if (response.status === 200) {
    comment.remove();
  }
};

commentDeleteBtns.forEach((btn) => {
  btn.addEventListener("click", handleDeleteComment);
});
