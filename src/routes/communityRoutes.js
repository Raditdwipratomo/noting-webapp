const uploadKomunitas = require("../middlewares/uploadCommunity");

router.post(
  "/komunitas",
  uploadKomunitas.single("foto"),
  komunitasController.createPost,
);

router.post(
  "/komunitas",
  uploadKomunitas.array("foto", 5), // max 5 foto
  komunitasController.createPost
);
