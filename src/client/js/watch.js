const deleteBtn = document.querySelector(".deleteBtn");

function deleteConfirm(event) {
  if (!confirm("Do you really want to delete this video?")) {
    event.preventDefault();
  }
}

deleteBtn.addEventListener("click", deleteConfirm);
