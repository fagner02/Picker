import faunadb from "faunadb";
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
  console.log(str.length);
  return await client.query(
    q.Create("Images", { data: { image: str, points: [] } })
  );
}

var userRef: null | object = null;

async function addImages() {
  var count = 0;
  var temp = (await loadImage(count)) as any;
  var imageRef = temp.ref;
  client.query(
    q.Update(userRef as faunadb.ExprArg, { data: { start: imageRef } })
  );

  while (temp != null) {
    count++;
    temp = (await loadImage(count)) as any;
  }
  console.log("after");
  client.query(
    q.Update(userRef as faunadb.ExprArg, { data: { count: count } })
  );
}

document.getElementById("buffer-file")!.onchange = loadBuffer;
function loadBuffer(e: any) {
  if (userRef == null) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    console.log("read");
    buffer = event.target!.result as ArrayBuffer;
    addImages();
  };
  reader.readAsArrayBuffer(e.target!.files[0]);
}
client
  .query(
    q.Map(
      q.Paginate(q.Documents(q.Collection("Images"))),
      q.Lambda(["ref"], q.Delete(q.Var("ref")))
    )
  )
  .then((x) => console.log(x));
async function selectUser() {
  const name = (document.getElementById("set-name") as HTMLInputElement).value;
  const users = await client.query(
    q.Select(
      "data",
      q.Filter(
        q.Paginate(q.Documents(q.Collection("Users"))),
        q.Lambda(
          "user",
          q.Equals(q.Select(["data", "name"], q.Get(q.Var("user"))), name)
        )
      )
    )
  );
  const notExist = await client.query(q.Equals(q.Count(users), 0));
  if (notExist) return;
  userRef = await client.query(q.Select(0, users));
}

async function addUser() {
  const name = (document.getElementById("set-name") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;
  const exists = !(await client.query(
    q.Equals(
      q.Count(
        q.Select(
          ["data"],
          q.Filter(
            q.Paginate(q.Documents(q.Collection("Users"))),
            q.Lambda(
              "user",
              q.Equals(q.Select(["data", "name"], q.Get(q.Var("user"))), name)
            )
          )
        )
      ),
      0
    )
  ));
  console.log(
    await client.query(
      q.Select(
        ["data"],
        q.Filter(
          q.Paginate(q.Documents(q.Collection("Users"))),
          q.Lambda(
            "user",
            q.Equals(q.Select(["data", "name"], q.Get(q.Var("user"))), name)
          )
        )
      )
    )
  );
  if (exists) {
    console.log("exists", name);
    return;
  }
  const uri =
    process.env.HASH +
    "?a=" +
    encodeURIComponent(name) +
    "&b=" +
    encodeURIComponent(password);
  console.log(uri);
  const hashPassword = await (
    await fetch(uri, {
      method: "GET",
    })
  ).text();
  userRef = (
    (await client.query(
      q.Create("Users", { data: { name: name, password: hashPassword } })
    )) as any
  ).ref;
  const ss = await client.query(
    q.Select(["data", "password"], q.Get(userRef!))
  );
  console.log(name, hashPassword == (ss as any), hashPassword);
}
(window as any).addUser = addUser;
(window as any).selectUser = selectUser;

// q.Paginate(q.Documents(q.Collection("Images")), { before });
