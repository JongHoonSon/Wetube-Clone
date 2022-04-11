const deleteBtn = document.querySelector(".deleteBtn");

function checkUserLikeVideo() {
  const likebtn = document.querySelector(".likebtn");
  const videoInfo = likebtn.dataset.video;
  const loggedInUserId = likebtn.dataset.id;

  JSON.parse(videoInfo).likeUsers.forEach((likeUserId) => {
    if (likeUserId === loggedInUserId) {
      likebtn.classList.add("like");
      likebtn.classList.remove("unlike");
    }
  });
}

function deleteConfirm(event) {
  if (!confirm("Do you really want to delete this video?")) {
    event.preventDefault();
  }
}

checkUserLikeVideo();
deleteBtn.addEventListener("click", deleteConfirm);
