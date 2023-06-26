import { Buffer } from "buffer";

var buffer: ArrayBuffer = new ArrayBuffer(1);
function loadImage(index: number) {
  const arr = new Uint8Array(
    buffer.slice(index * 30000, index * 30000 + 30000)
  );
  if (arr.length < 30000) return null;
  var str = "";
  for (var i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  }

  return { image: str, points: [] };
}

async function sendImages(images: any, endpoint: string) {
  return await (
    await fetch(`${process.env.HASH!}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.token}`,
      },
      body: JSON.stringify({ images }),
    })
  ).text();
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function addImages() {
  var count = 0;
  console.log("loading");
  var temp = loadImage(count);
  var imageId = await sendImages(temp, "image");

  let images: any[] = [];
  while (temp != null) {
    if (count > 0) images.push(temp);
    if (images.length == 50) {
      console.log(images.length);
      await sendImages(images, "images");
      images = [];
    }
    count++;
    temp = loadImage(count);
  }
  if (images.length > 0) {
    await sendImages(images, "images");
    images = [];
  }
  console.log("after");
  await fetch(`${process.env.HASH!}/user`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.token}`,
    },
    body: JSON.stringify({ imageId, count }),
  });
}

document.getElementById("buffer-file")!.onchange = loadBuffer;
function loadBuffer(e: any) {
  const reader = new FileReader();
  reader.onload = (event) => {
    console.log("read");
    buffer = event.target!.result as ArrayBuffer;
    addImages();
  };
  reader.readAsArrayBuffer(e.target!.files[0]);
}

async function selectUser() {
  const name = (document.getElementById("set-name") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;

  console.log(name, password, `${name}:${password}`);
  const cred = (
    await fetch(process.env.HASH! + "/login", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${name}:${password}`).toString(
          "base64"
        )}`,
      },
    })
  ).headers.get("authorization");
  sessionStorage.token = cred!;
}

async function addUser() {
  const name = (document.getElementById("set-name") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;

  const cred = (
    await fetch(process.env.HASH! + "/user", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${name}:${password}`).toString(
          "base64"
        )}`,
      },
    })
  ).headers.get("authorization");
  sessionStorage.token = cred!;
}
(window as any).addUser = addUser;
(window as any).selectUser = selectUser;
(window as any).Buffer = Buffer;
