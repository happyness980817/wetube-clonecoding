import Video from "../models/Video";
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
  const videos = await Video.find({}).sort({ createdAt: "desc" }).populate("owner"); // 데이터베이스에서 데이터를 읽어올 때까지 기다린다.
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");

  /* populate
  원래대로였으면 const owner 이렇게 해서 video 의 _id 를 가져오던지 했는데
  populate 로 Video model 에 있는 
  User model 과 연동된 진짜 user id object 를 가져올 수 있다. ("User" 를 refer)
  */

  console.log(video); // 출력해보면 video 에 owner 속성이 추가된 것을 확인

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
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session; // const _id = req.session.user._id;
  const { path: fileUrl } = req.file;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl,
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
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndDelete(id); // 영상 삭제
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
