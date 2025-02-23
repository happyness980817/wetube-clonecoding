export const trending = (req, res) => {
  const videos = [
    {
      title: "First Video",
      rating: 5,
      numOfcomments: 2,
      createdAt: "Yesterday",
      views: 59,
      id: 1,
    },
    {
      title: "Second Video",
      rating: 5,
      numOfcomments: 2,
      createdAt: "Yesterday",
      views: 59,
      id: 1,
    },
    {
      title: "Third Video",
      rating: 5,
      numOfcomments: 2,
      createdAt: "Yesterday",
      views: 59,
      id: 1,
    },
  ];
  res.render("home", { pageTitle: "Home", videos });
};
export const see = (req, res) => res.render("watch");
export const edit = (req, res) => res.render("edit");
export const search = (req, res) => res.send("Search");
export const upload = (req, res) => res.send("Upload");
export const deleteVideo = (req, res) => {
  console.log(req.params);
  return res.send("Delete Video");
};
