const express = require("express");
const router = express.Router();

const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");

// ---------------------------
// 			VIDEO
// ---------------------------

let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/");
	},
	filename: function (req, file, cb) {
		cb(null, `${Date.now()}_${file.originalname}`);
	},
	fileFilter: function (req, file, cb) {
		const extenstion = path.extname(file.originalname);

		if (extenstion !== "mp4") {
			return cb(res.status(400).end("mp4 파일이 아닙니다"), false);
		}

		cb(null, true);
	},
});

let upload = multer({ storage: storage }).single("file");

router.post("/uploadfiles", (req, res) => {
	// 비디오 업로드
	upload(req, res, (err) => {
		if (err) res.json({ success: false, err });

		return res.json({ success: true, url: res.req.file.path, fileName: res.req.file.filename });
	});
});

router.post("/thumbnail", (req, res) => {
	let filePath = "";
	let fileDuration = "";

	// 비디오 정보 가져오기
	ffmpeg.ffprobe(req.body.url, function (err, metadata) {
		console.log(metadata);
		// fileDuration = metadata.format.duration;
	});

	// 썸네일 생성
	ffmpeg(req.body.url)
		.on("filenames", function (filenames) {
			// console.log(filenames);
			filePath = "uploads/thumbnails/" + filenames[0];
		})
		.on("end", function () {
			return res.json({ success: true, url: filePath, fileDuration: fileDuration });
		})
		.on("error", function (err) {
			console.log(err);
			return res.json({ success: false, err });
		})
		.takeScreenshots(
			{
				count: 3,
				folder: "uploads/thumbnails/",
				size: "320x240",
				filename: "thumbnail-%b.png",
			}
			// "upload/thumbnails/"
		);
});

module.exports = router;