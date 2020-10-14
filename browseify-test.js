const similarity = require("compute-cosine-similarity");

const x = [5, 23, 2, 5, 9],
  y = [3, 21, 2, 5, 14];

const s = similarity(x, y);

console.log(s);

const p = document.getElementById("browserify-test");
p.innerText = s;
