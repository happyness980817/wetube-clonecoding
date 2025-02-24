let videos = [
  {
    title: "First Video",
    rating: 5,
    numOfcomments: 2,
    createdAt: "Yesterday",
    views: 1,
    id: 1,
  },
  {
    title: "Second Video",
    rating: 5,
    numOfcomments: 2,
    createdAt: "Yesterday",
    views: 59,
    id: 2,
  },
  {
    title: "Third Video",
    rating: 5,
    numOfcomments: 2,
    createdAt: "Yesterday",
    views: 59,
    id: 3,
  },
];

export const trending = (req, res) => {
  return res.render("home", { pageTitle: "Home", videos });
};
export const watch = (req, res) => {
  const { id } = req.params; // const id = req.params.id;
  const video = videos[id - 1];
  return res.render("watch", { pageTitle: `Watching: ${video.title}`, video });
};
export const getEdit = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  return res.render("edit", { pageTitle: `Editing: ${video.title}`, video });
}; // form 을 화면에 보여줌줌
export const postEdit = (req, res) => {}; // 변경사항을 저장
