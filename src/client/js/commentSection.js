const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const btn = form.querySelector("button");

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text.trim() === "") {
    return;
  }
  await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }), // 'body' means 'req.body'
  });
  textarea.value = "";
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
}
