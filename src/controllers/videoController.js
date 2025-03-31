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
  const videos = await Video.find({}).sort({ createdAt: "desc" }); // 데이터베이스에서 데이터를 읽어올 때까지 기다린다.
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");

  /* populate
  Mongoose에는 populate()를 통해 다른 컬렉션의 문서를 참조할 수 있습니다. 
  Population은 문서의 지정된 경로를 다른 컬렉션의 문서로 자동 교체하는 프로세스입니다. 
  단일 문서, 여러 문서, 일반 개체, 여러 일반 개체 또는 쿼리에서 반환된 모든 개체를 채울 수 있습니다.
  const story = await Story.findOne({ title: 'Casino Royale' }).populate('author');
  https://mongoosejs.com/docs/populate.html

  Population
  https://mongoosejs.com/docs/populate.html#population */

  console.log(video);

  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("edit", { pageTitle: `Edit <${video.title}>`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id }); // _id === req.params.id 인지 확인

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
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
    await Video.create({
      title,
      description,
      fileUrl,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
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
  await Video.findByIdAndDelete(id);
  // delete video
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
    });
  }
  return res.render("search", { pageTitle: "Search", videos });
};
