const videoSelectBtn = document.getElementById("videoSelectBtn");
videoSelectBtn.onclick = getVideoSources;
const videoElement = document.getElementById("video-element-one");
const videoElement2 = document.getElementById("video-element-two");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const { desktopCapturer, remote } = require("electron");
const { writeFile } = require("fs");
const { dialog, Menu } = remote;

// Get the avialable video sources
async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });
  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((src) => {
      return {
        label: src.name,
        click: () => selectSource(src),
      };
    })
  );
  videoOptionsMenu.popup();
}

let mediaRecorder;
const recordedChunks = [];

const selectSource = async (source) => {
  videoSelectBtn.innerText = source.name;
  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
      },
    },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  //preview the source in the video element
  videoElement.srcObject = stream;
  videoElement.play();

  //create the media recorder

  mediaRecorder = new MediaRecorder(stream, {
    mimType: "video/webm; codecs=vp9",
  });

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
};

startBtn.onclick = (e) => {
  mediaRecorder.start();
  startBtn.classList.add("is-danger");
  startBtn.innerText = "recording....";
};

stopBtn.onclick = (e) => {
  mediaRecorder.stop();
  startBtn.classList.remove("is-danger");
  startBtn.innerText = "Start";
};

const handleDataAvailable = (e) => {
  console.log("video data available");
  console.log(e.data)
  recordedChunks.push(e.data);
};

const handleStop = async (e) => {
  const bolb = new Blob(recordedChunks, {
    type: "video/webm; codecs=vp9",
  });
  const buffer = Buffer.from(await bolb.arrayBuffer());
  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: "save video",
    defaultPath: `vid-${Date.now()}.webm`,
  });
  writeFile(filePath, buffer, () => {
    console.log("video saved successfully !");
  });
};


