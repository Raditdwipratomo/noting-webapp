function countingValleys(steps, path) {
  // Write your code here
  let result = 1;
  for (let i = 0; i < steps; i++) {
    if (path[i] === "D") {
      result = result - 1;
    } else {
      result = result + 1;
    }
    console.log(i, result, path[i]);
  }

  console.log(result);
}

countingValleys(12, [
  "D",
  "D",
  "U",
  "U",
  "D",
  "D",
  "U",
  "D",
  "U",
  "U",
  "U",
  "D",
]);
