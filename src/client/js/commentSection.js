const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const btn = form.querySelector("button");
const deleteCommentBtn = document.getElementById("delete__comment");

const addComment = (text) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  newComment.appendChild(icon);
  newComment.appendChild(span);
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text.trim() === "") {
    return;
  }
  const { status } = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }), // 'body' means 'req.body'
  });
  textarea.value = "";
  if (status === 201) {
    addComment(text);
  }
};

const deleteComment = async (commentId, btn) => {
  const res = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
  });
  if (res.status === 200) {
    const li = btn.closest("li.video__comment");
    li && li.remove();
  } else {
    console.error("댓글 삭제 실패", await res.text());
  }
};

const initDeleteButtons = () => {
  const deleteBtns = document.querySelectorAll(".delete__comment");
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const commentId = btn.dataset.id;
      deleteComment(commentId, btn);
    });
  });
};

if (form) {
  form.addEventListener("submit", handleSubmit);
  // ② textarea 에 keydown 리스너 추가
  textarea.addEventListener("keydown", (e) => {
    // Shift+Enter 는 줄바꿈으로 남기고, 그냥 Enter 면 제출
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  });
  initDeleteButtons();
}
