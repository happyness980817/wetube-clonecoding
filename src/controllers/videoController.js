import Video from "../models/Video";
import Comment from "../models/Comment";
import User from "../models/User";

/* 
console.log("start");
Video.find({}, (error, videos) => {
  if(error){
    return res.render("server-error");
  };
  return res.render("home", { pageTitle: "Home", videos });
});
console.log("finished");  --> start, finished, videos 순서로 출력 (render 에 시간이 걸린다. Videos.find() 는 비동기적으로 처리 )
*/

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner"); // 데이터베이스에서 데이터를 읽어올 때까지 기다린다.
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");

  /* populate
  원래대로였으면 const owner 이렇게 해서 video 의 _id 를 가져오던지 했는데
  populate 로 Video model 에 있는 
  User model 과 연동된 진짜 user id object 를 가져올 수 있다. ("User" 를 refer)
  */

  // console.log(video); // 출력해보면 video 에 owner 속성이 추가된 것을 확인

  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not Authorized.");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit <${video.title}>`, video });
};

export const postEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id }); // _id === req.params.id 인지 확인

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of this video.");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("success", "Changes Saved.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session; // const _id = req.session.user._id;
  const { video, thumb } = req.files;
  console.log("Video file:", video[0]); // 파일 정보 확인
  console.log("Thumbnail file:", thumb[0]); // 파일 정보 확인
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].location,
      thumbUrl: thumb[0].location,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    await user.save();
    return res.redirect("/");
  } catch (error) {
    // console.log(error);
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;

  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of this video.");
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndDelete(id); // 영상을 db 에서도 삭제
  const user = await User.findById(_id);
  user.videos = user.videos.filter((videoId) => String(videoId) !== id);
  // filter 내부에 callback 을 지정하면 콜백 내의 첫 번째 파라미터로 배열의 각 원소가 하나씩 전달, 순회
  // Array.prototype.filter() 의 첫 번째 parameter 는 반드시 callback function
  await user.save(); // 비동기 저장

  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"), // searches for words that contain keyword variable
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  await video.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const { id } = req.params; // comment ID
  const comment = await Comment.findById(id);
  if (!comment) {
    return res.sendStatus(404);
  }
  // 1) 댓글 삭제
  await Comment.findByIdAndDelete(id);
  // 2) 해당 댓글을 소유한 비디오 문서에서 comments 배열에서 제거
  await Video.findByIdAndUpdate(comment.video, {
    $pull: { comments: id },
  });
  return res.sendStatus(200);
};
