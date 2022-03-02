const express = require("express");

const cors = require("cors");

const bodyParser = require("body-parser");

const pool = require("./Pool");
const path = require("path");
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
}
console.log(__dirname);
console.log(path.join(__dirname, "client/build"));

app.use(bodyParser.urlencoded({ extended: false }));

const videoData = require("./exampleresponse.json");

// GET "/"
app.get("/allVideos", (req, res) => {
  pool.query("SELECT * FROM videos", (error, result) => {
    return res.json(result.rows);
  });
});

// DELETE "/{id}"
app.delete("/:id", (req, res) => {
  const { id } = req.params;

  const remainingVideos = videoData.filter(
    (video) => video.id !== parseInt(id)
  );

  const deletedVideo = videoData.find((video) => video.id == parseInt(id));

  if (remainingVideos.length == videoData.length) {
    return res.status(400).json({
      success: false,
      message:
        "It appears that nothing was deleted, make sure the selected id exists...",
    });
  }

  return res.status(200).json({
    success: true,
    remainingVideos,
    deletedVideo,
  });
});

// GET "/{id}"
app.get("/:id", (req, res) => {
  const { id } = req.params;
  const chosenVideo = videoData.filter((video) => video.id == parseInt(id));

  if (chosenVideo.length == 0) {
    return res.status(400).json({
      success: false,
      message: "It appears no video id match your search...",
    });
  }

  return res.status(200).json({
    success: true,
    chosenVideo,
  });
});

//  POST
app.post("/", (req, res) => {
  const { videoTitle, videoUrl, videoId } = req.body;

  if (!videoTitle || !videoUrl || !videoId) {
    return res.status(404).json({
      success: false,
      message: "Please provide video title and url...",
      videos: videoData,
    });
  }

  const updatedVideos = [...videoData];

  updatedVideos.push({
    id: videoId,
    title: videoTitle,
    url: videoUrl,
  });

  return res.status(200).json({
    success: true,
    addedID: updatedVideos[updatedVideos.length - 1].id,
    videos: updatedVideos,
  });
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
