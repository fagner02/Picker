import faunadb from "faunadb";
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.KEY!,
  endpoint: process.env.ENDPOINT,
});

var imagesRef: any[] = [];
async function login() {
  const name = (document.getElementById("name") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;
  const users = await client.query(
    q.Filter(
      q.Paginate(q.Documents(q.Collection("Users"))),
      q.Lambda(
        "user",
        q.Equals(q.Select(["data", "name"], q.Get(q.Var("user"))), name)
      )
    )
  );
  const notExist = await client.query(
    q.Equals(q.Count(q.Select("data", users)), 0)
  );
  if (notExist) return;
  const user = (await client.query(q.Get(q.Select(["data", 0], users)))) as any;
  const uri =
    process.env.HASH +
    "?a=" +
    encodeURIComponent(name) +
    "&b=" +
    encodeURIComponent(password);
  const hashPassword = await (await fetch(uri, { method: "GET" })).text();
  const actual = user.data.password;
  if (actual != hashPassword) {
    console.log("rejected");
    return;
  }
  console.log(user.data.end, user.data.start);
  imagesRef = (await client.query(
    q.Select(
      "data",
      q.Paginate(q.Documents(q.Collection("Images")), {
        size: user.data.count,
        after: [user.data.start],
      })
    )
  )) as any[];
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

let countStep = 0;
let step = true;
const axisx = document.querySelector(".axisx") as HTMLElement;
const axisy = document.querySelector(".axisy") as HTMLElement;
const moveMarker = (e: MouseEvent) => {
  const marker = selectedMarker as HTMLElement;
  marker!.style.top = `${e.clientY}px`;
  marker!.style.left = `${e.clientX}px`;
  axisy!.style.top = `${e.clientY}px`;
  axisx!.style.left = `${e.clientX}px`;
};
const deselectMarker = (e: MouseEvent) => {
  const marker = selectedMarker as HTMLElement;
  marker.className = "marker";
  marker!.style.top = `${e.clientY}px`;
  marker!.style.left = `${e.clientX}px`;
  const rect = box.getBoundingClientRect();

  const l = Math.floor(Math.abs(e.clientY - rect.top - 1) / 5);
  const c = Math.floor(Math.abs(e.clientX - rect.left - 1) / 5);
  console.log(l, c);
  const markers = document.querySelectorAll(".marker");
  markers.forEach((x) => ((x as HTMLElement).style.pointerEvents = "auto"));
  box.onmousemove = null;
  box.onclick = null;
  countStep = 0;
};
const box = document.querySelector(".box") as HTMLElement;
const divisions = 100;
let selectedMarker: null | HTMLElement = null;
const markerSlots = document.querySelector(".marker-slots");
for (let i = 0; i < fingerCount; i++) {
  const marker = document.createElement("div");
  const slot = document.createElement("div");
  slot.className = "marker-slot";
  markerSlots?.append(slot);
  const rect = slot.getBoundingClientRect();
  marker.className = "marker";
  marker.style.background = `hsl(${Math.floor(
    i * (280 / (fingerCount - 1))
  )}, 90%, 50%, 70%)`;
  marker!.style.top = `${rect.top + 9}px`;
  marker!.style.left = `${rect.left + 9}px`;
  marker.onclick = (e) => {
    selectedMarker = e.target as HTMLElement;
    marker.className = "marker selected";
    // marker!.style.top = `${e.clientY}px`;
    // marker!.style.left = `${e.clientX}px`;
    const markers = document.querySelectorAll(".marker");
    markers.forEach((x) => ((x as HTMLElement).style.pointerEvents = "none"));
    console.log("hello");
    e.stopPropagation();
    box.onmousemove = moveMarker;
    box.onclick = deselectMarker;
  };
  marker.innerText = (i + 1).toString();
  document.body.append(marker);
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
  const img = (await client.query(
    q.Select(["data", "image"], q.Get(imagesRef[index]))
  )) as string;
  const markers = document.querySelectorAll(".markers");
  const rect = box.getBoundingClientRect();
  res.forEach((x, i) => {
    const point = (x / 100)
      .toString()
      .split(".")
      .map((y) => parseInt(y));
    (markers[i] as HTMLElement).style.top = `${
      point[1] * 5 + 2.5 + rect.top
    }px`;
    (markers[i] as HTMLElement).style.left = `${
      point[0] * 5 + 2.5 + rect.left
    }px`;
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
  console.log(res[0].length);
  res[index].forEach((x: number, i: number) => {
    const c = Math.floor(x / 100);
    const l = x - c * 100;
    (markers[i] as HTMLElement).style.top = `${c * 5 + 2.5 + rect.top}px`;
    (markers[i] as HTMLElement).style.left = `${l * 5 + 2.5 + rect.left}px`;
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
  setImage();
}

(window as any).login = login;
(window as any).clearInputs = clearInputs;
(window as any).setIndex = setIndex;
