const avatarUpload = document.querySelector(".avatarUpload");

function handleUploadAvatar() {
  if (avatarUpload.files && avatarUpload.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("preview").src = e.target.result;
    };
    reader.readAsDataURL(avatarUpload.files[0]);
  } else {
    const { id } = avatarUpload.dataset;
    document.getElementById("preview").src = id;
  }
}

avatar.addEventListener("change", handleUploadAvatar);
