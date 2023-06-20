import faunadb from "faunadb";
import dotenv from "dotenv";
dotenv.config();
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.KEY!,
  endpoint: process.env.ENDPOINT,
});

var buffer: ArrayBuffer = new ArrayBuffer(1);
async function loadImage(index: number) {
  const arr = new Uint8Array(
    buffer.slice(index * 30000, index * 30000 + 30000)
  );
  if (arr.length < 30000) return null;
  var str = "";
  for (var i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  }

  return await client.query(
    q.Create("Images", { data: { image: str, points: [] } })
  );
}

var userRef: null | object = null;

async function addImages() {
  var count = 0;
  var imageRef = loadImage(count);
  client.query(
    q.Update(userRef as faunadb.ExprArg, { data: { start: imageRef } })
  );
  while (imageRef != null) {
    count++;
    imageRef = loadImage(count);
  }
  client.query(
    q.Update(userRef as faunadb.ExprArg, { data: { end: imageRef } })
  );
}

document.getElementById("buffer-file")!.onchange = loadBuffer;
function loadBuffer(e: any) {
  const reader = new FileReader();
  reader.onload = (event) => {
    buffer = event.target!.result as ArrayBuffer;
    addImages();
  };
  reader.readAsArrayBuffer(e.target!.files[0]);
}

async function selectUser() {
  const name = (document.getElementById("set-name") as HTMLInputElement).value;
  userRef = await client.query(
    q.Select(
      0,
      q.Filter(
        q.Paginate(q.Documents(q.Collection("Users"))),
        q.Lambda(
          "user",
          q.Equals(q.Select(["data", "name"], q.Get(q.Var("user"))), name)
        )
      )
    )
  );
}

async function addUser() {
  const name = (document.getElementById("set-name") as HTMLInputElement).value;

  userRef = await client.query(
    q.Select(
      0,
      q.Filter(
        q.Paginate(q.Documents(q.Collection("Users"))),
        q.Lambda(
          "user",
          q.Equals(q.Select(["data", "name"], q.Get(q.Var("user"))), name)
        )
      )
    )
  );

  userRef = (
    (await client.query(q.Create("Users", { data: { name: name } }))) as any
  ).ref;
}
(window as any).addUser = addUser;
(window as any).selectUser = selectUser;

// q.Paginate(q.Documents(q.Collection("Images")), { before });
