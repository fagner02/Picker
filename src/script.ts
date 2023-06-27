import { Buffer } from "buffer";

var imagesIds: any[] = [];
async function login() {
  const name = (document.getElementById("name") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;

  const response = await fetch(process.env.HASH! + "/login", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${name}:${password}`).toString(
        "base64"
      )}`,
    },
  });
  sessionStorage.token = response.headers.get("authorization");

  const uri = `${process.env.HASH!}/images`;
  imagesIds = await (
    await fetch(uri, {
      method: "GET",
      headers: {
        authorization: `Bearer ${sessionStorage.token}`,
      },
    })
  ).json();
}

fetch("labels.txt").then(async (x) => {
  const text = await x.text();
  res = text
    .replace(/[\[\]]/g, "")
    .split("\n")
    .map((x) => x.split(",").map(Number));
});

const fingerCount = 15;
for (var i = 0; i < fingerCount; i++) {
  const elem = document.createElement("input");
  elem.type = "number";
  elem.id = `n${i}`;
  elem.onclick = selectInput;
  document.body.append(elem);
}
var filled = fingerCount;
function selectInput(e: any) {
  const value = parseInt(e.target.id.substring(1));
  current = value;
}

(document.getElementById("n0") as any).focus();

const axisx = document.querySelector(".axisx") as HTMLElement;
const axisy = document.querySelector(".axisy") as HTMLElement;
const moveMarker = (e: MouseEvent) => {
  const marker = selectedMarker as HTMLElement;
  const rect = box.getBoundingClientRect();

  setMarkerStyle(marker, [
    `${(100 * (e.clientY - rect.top)) / rect.height}%`,
    `${(100 * (e.clientX - rect.left)) / rect.width}%`,
  ]);
  axisy!.style.top = `${e.clientY}px`;
  axisx!.style.left = `${e.clientX}px`;
};
const deselectMarker = (e: MouseEvent) => {
  const rect = box.getBoundingClientRect();
  const marker = selectedMarker as HTMLElement;
  marker.className = "marker";

  setMarkerStyle(marker, [
    `${(100 * (e.clientY - rect.top)) / rect.height}%`,
    `${(100 * (e.clientX - rect.left)) / rect.width}%`,
    "2",
  ]);

  const blockH = rect.height / 100;
  const blockV = rect.width / 100;
  const l = Math.floor(Math.abs(e.clientY - rect.top - 1) / blockH);
  const c = Math.floor(Math.abs(e.clientX - rect.left - 1) / blockV);
  console.log(l, c);
  document.getElementById("xy")!.innerText = `x: ${l}\ny: ${c}`;
  setPointerEvents("auto");
  box.onmousemove = null;
  box.onclick = null;
};

function setPointerEvents(value: string) {
  const markers = document.querySelectorAll(".marker");
  const slots = document.querySelectorAll(".marker-slot");
  markers.forEach((x) => {
    setMarkerStyle(x as HTMLElement, [null, null, null, value]);
  });
  slots.forEach((x) => {
    (x as HTMLElement).style.pointerEvents = value;
  });
}

function setMarkerStyle(marker: HTMLElement, values: any) {
  let cssText = marker.style.cssText.split(";");
  if (values[0]) cssText[0] = `top: ${values[0]}`;
  if (values[1]) cssText[1] = `left: ${values[1]}`;
  if (values[2]) cssText[2] = `z-index: ${values[2]}`;
  if (values[3]) cssText[3] = `pointer-events: ${values[3]}`;
  if (values[4]) cssText[4] = `background: ${values[4]}`;
  marker.style.cssText = cssText.join(";");
}

const box = document.querySelector(".box") as HTMLElement;
const divisions = 100;
let selectedMarker: null | HTMLElement = null;
const markerSlots = document.querySelector(".marker-slots");
for (let i = 0; i < fingerCount; i++) {
  const marker = document.createElement("div");
  const slot = document.createElement("div");
  slot.className = "marker-slot";
  slot.innerText = (i + 1).toString();
  slot.onclick = (e) => {
    e.stopPropagation();
    marker.click();
  };
  markerSlots?.append(slot);
  const rect = slot.getBoundingClientRect();
  marker.className = "marker";
  marker.style.cssText =
    "top: 0;left: 0;z-index: 0;pointer-events:auto;background: 0";
  setMarkerStyle(marker, [
    `${rect.top + 9}%`,
    `${rect.left + 9}%`,
    null,
    null,
    `hsl(${Math.floor(i * (280 / (fingerCount - 1)))}, 90%, 50%, 70%)`,
  ]);

  marker.onclick = (e) => {
    e.stopPropagation();
    console.log("in", marker);
    selectedMarker = marker;
    marker.className = "marker selected";
    setMarkerStyle(marker, [null, null, "3"]);
    const markers = document.querySelectorAll(".marker");
    setPointerEvents("none");
    console.log("hello");
    box.onmousemove = moveMarker;
    box.onclick = deselectMarker;
  };
  marker.innerText = (i + 1).toString();
  const mm = document.querySelector(".markers") as HTMLElement;
  mm.append(marker);
}

for (var k = 0; k < divisions; k++) {
  const line = document.createElement("div");
  line.className = "line";
  for (var i = 0; i < divisions; i++) {
    const elem = document.createElement("div");
    elem.className = "dot";
    elem.id = `s${k * divisions + i}`;
    line.append(elem);
  }
  box.append(line);
}

var current = fingerCount;
var res: any[] = [];
function select(e: any) {
  if (current > fingerCount - 1) return;
  const value = parseInt(e.target.id.substring(1));
  e.target.style.background = "rgb(0,0,0)";
  var inputNum = document.getElementById(`n${current}`) as HTMLInputElement;
  if (inputNum.value == "") {
    filled++;
  }
  inputNum.value = value.toString();
  if (res[index - 1].length <= current) {
    res[index - 1].push(value);
  } else {
    const aux = { current, index, filled };
    filled = fingerCount;
    res[index - 1][current] = value;
    index--;
    setImage();
    current = aux.current;
    filled = aux.filled;
    index = aux.index;
  }
  current++;
  document.getElementById(`n${current}`)?.focus();
}

var buffer: null | ArrayBuffer = null;
fetch("test.txt").then(async (x) => {
  buffer = await x.arrayBuffer();
  setImage();
});

async function setImageK() {
  if (filled < fingerCount) return;
  const img = await (
    await fetch(`${process.env.HASH!}/image-str?id=${imagesIds[index]}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${sessionStorage.token}`,
      },
    })
  ).text();
  const rect = box.getBoundingClientRect();
  const blockH = rect.height / 100;
  const blockV = rect.width / 100;
  const markers = document.querySelectorAll(".marker");
  res[index].forEach((x: number, i: number) => {
    const l = Math.floor(x / 100);
    const c = x - l * 100;
    setMarkerStyle(markers[i] as HTMLElement, [
      `${(100 * (l * blockH + 2.5)) / rect.height}%`,
      `${(100 * (c * blockV + 2.5)) / rect.width}%`,
    ]);
  });
  const arr = new Uint8Array(img.length);
  for (var i = 0; i < img.length; i++) {
    arr[i] = img.charCodeAt(i);
  }

  for (var i = 0; i < arr.length; i++) {
    if (
      res[index] != undefined &&
      res[index].find((x: number) => x == Math.floor(i / 3))
    ) {
      document.getElementById(`s${Math.floor(i / 3)}`)!.style.background =
        "rgb(0,0,0)";
      i += 2;
      continue;
    }
    document.getElementById(`s${Math.floor(i / 3)}`)!.style.background = `rgb(${
      arr[i]
    }, ${arr[i + 1]}, ${arr[i + 2]})`;

    i += 2;
  }
  console.log(res[index - 1]?.toString());
  current = 0;
  if (res.length == index) {
    res.push([]);
  }
  (document.getElementById("index") as HTMLInputElement).value =
    index.toString();
  index++;
  filled = 0;
}

var index = 0;
function setImage() {
  if (filled < fingerCount) return;
  const arr = new Uint8Array(
    buffer!.slice(index * 30000, index * 30000 + 30000)
  );
  const markers = document.querySelectorAll(".marker");
  const rect = box.getBoundingClientRect();
  const blockH = rect.height / 100;
  const blockV = rect.width / 100;
  console.log(res[0].length);
  res[index].forEach((x: number, i: number) => {
    const l = Math.floor(x / 100);
    const c = x - l * 100;
    setMarkerStyle(markers[i] as HTMLElement, [
      `${(100 * (l * blockH + 2.5)) / rect.height}%`,
      `${(100 * (c * blockV + 2.5)) / rect.width}%`,
    ]);
  });
  for (var i = 0; i < arr.length; i++) {
    if (
      res[index] != undefined &&
      res[index].find((x: number) => x == Math.floor(i / 3))
    ) {
      document.getElementById(`s${Math.floor(i / 3)}`)!.style.background =
        "rgb(0,0,0)";
      i += 2;
      continue;
    }
    document.getElementById(`s${Math.floor(i / 3)}`)!.style.background = `rgb(${
      arr[i]
    }, ${arr[i + 1]}, ${arr[i + 2]})`;

    i += 2;
  }
  console.log(res[index - 1]?.toString());
  current = 0;
  if (res.length == index) {
    res.push([]);
  }
  (document.getElementById("index") as HTMLInputElement).value =
    index.toString();
  index++;
  filled = 0;
}

function clearInputs() {
  if (filled < fingerCount) return;
  for (var i = 0; i < fingerCount; i++) {
    const elem = document.getElementById(`n${i}`) as HTMLInputElement;
    elem.value = "";
  }
}
function setIndex() {
  const newIndex = parseInt(
    (document.getElementById("index") as HTMLInputElement).value
  );
  while (index < newIndex) {
    if (res.length <= index) {
      res.push([]);
    }
    index++;
  }
  index = newIndex;
  filled = fingerCount;
  setImageK();
}

(window as any).login = login;
(window as any).clearInputs = clearInputs;
(window as any).setIndex = setIndex;
