import faunadb from "faunadb";
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.KEY!,
  endpoint: process.env.ENDPOINT,
});

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

const size = 5;
const box = document.querySelector(".box") as HTMLElement;
box!.style.display = "flex";
box!.style.flexWrap = "wrap";
box!.style.width = `${100 * size}px`;
for (var i = 0; i < 100 * 100; i++) {
  const elem = document.createElement("div");
  elem.style.width = `${size}px`;
  elem.style.height = `${size}px`;
  elem.style.background = "rgb(0,0,0)";
  elem.id = `s${i}`;
  elem.onclick = select;
  box.append(elem);
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

var index = 0;
function setImage() {
  if (filled < fingerCount) return;
  const arr = new Uint8Array(
    buffer!.slice(index * 30000, index * 30000 + 30000)
  );

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
