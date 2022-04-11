const likebtn = document.querySelector(".likebtn");
const deleteBtn = document.querySelector(".deleteBtn");

function deleteConfirm(event) {
  if (!confirm("Do you really want to delete this video?")) {
    event.preventDefault();
  }
}

function handleLikebtnClick(event) {
  const { id } = likebtn.dataset;
  fetch(`/videos/${id}/like`, {
    method: "POST",
  });
}

likebtn.addEventListener("click", handleLikebtnClick);
deleteBtn.addEventListener("click", deleteConfirm);
