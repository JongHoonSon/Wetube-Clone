const { async } = require("regenerator-runtime");

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const commentEditBtns = document.querySelectorAll(".video__comment__edit-btn");
const commentDeleteBtns = document.querySelectorAll(
  ".video__comment__delete-btn"
);

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
    window.location.reload();
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

const handleEditComment = (event) => {
  const commentEditBtn = event.target.parentElement;
  const commentBtnWrapper = commentEditBtn.parentElement;
  const comment = commentBtnWrapper.parentElement;
  const commentId = comment.dataset.id;
  const commentContentsWrapper = comment.childNodes[0];
  const commentSpanWrapper = commentContentsWrapper.childNodes[1];
  const commentTextSpan = commentSpanWrapper.childNodes[0];
  const commentTextTextarea = commentSpanWrapper.childNodes[1];
  const commentDeleteBtn = commentBtnWrapper.childNodes[1];

  commentEditBtn.classList.add("hidden");
  commentDeleteBtn.classList.add("hidden");
  commentTextSpan.classList.add("hidden");

  const commentEditConfirmBtn = commentBtnWrapper.childNodes[2];
  const commentEditCancelBtn = commentBtnWrapper.childNodes[3];

  commentEditConfirmBtn.classList.remove("hidden");
  commentEditCancelBtn.classList.remove("hidden");
  commentTextTextarea.classList.remove("hidden");

  commentEditConfirmBtn.onclick = async () => {
    console.log("textarea", commentTextTextarea.value);
    console.log("span", commentTextSpan.innerText);

    const text = commentTextTextarea.value;

    const response = await fetch(`/api/comments/${commentId}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (response.status === 200) {
      commentTextSpan.innerText = commentTextTextarea.value;

      commentEditBtn.classList.remove("hidden");
      commentDeleteBtn.classList.remove("hidden");
      commentTextSpan.classList.remove("hidden");

      commentEditConfirmBtn.classList.add("hidden");
      commentEditCancelBtn.classList.add("hidden");
      commentTextTextarea.classList.add("hidden");
    }
  };

  commentEditCancelBtn.onclick = () => {
    commentTextTextarea.value = commentTextSpan.innerText;
    commentEditBtn.classList.remove("hidden");
    commentDeleteBtn.classList.remove("hidden");
    commentTextSpan.classList.remove("hidden");

    commentEditConfirmBtn.classList.add("hidden");
    commentEditCancelBtn.classList.add("hidden");
    commentTextTextarea.classList.add("hidden");
  };
};

const handleDeleteComment = async (event) => {
  if (!confirm("Do you really want to delete this comment?")) {
    event.preventDefault();
    return;
  }

  const commentDeleteBtn = event.target.parentElement;
  const commentBtnWrapper = commentDeleteBtn.parentElement;
  const comment = commentBtnWrapper.parentElement;
  const commentId = comment.dataset.id;

  const response = await fetch(`/api/comments/${commentId}/delete`, {
    method: "DELETE",
  });

  if (response.status === 200) {
    comment.remove();
  }
};

commentEditBtns.forEach((btn) => {
  btn.addEventListener("click", handleEditComment);
});

commentDeleteBtns.forEach((btn) => {
  btn.addEventListener("click", handleDeleteComment);
});
