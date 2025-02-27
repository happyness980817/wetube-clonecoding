import Video from "../models/Video";

/* 
console.log("start");
Video.find({}, (error, videos) => {
  if(error){
    return res.render("server-error");
  };
  return res.render("home", { pageTitle: "Home", videos });
  });
  console.log("finished");  --> start, finished, videos 순서로 출력
*/

export const home = async (req, res) => {
  console.log("start");
  const videos = await Video.find({}); // 데이터베이스에서 데이터를 읽어올 때까지 기다린다.
  console.log(videos);
  console.log("finished");
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = (req, res) => {
  const { id } = req.params;
  return res.render("watch", { pageTitle: `Watching` });
};

export const getEdit = (req, res) => {
  const { id } = req.params;
  return res.render("edit", { pageTitle: `Editing` });
};

export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = (req, res) => {
  const { title } = req.body;
  return res.redirect("/");
};
