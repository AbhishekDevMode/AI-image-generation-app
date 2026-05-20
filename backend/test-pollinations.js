const finalPrompt = "test prompt";
const seed = Math.floor(Math.random() * 1000000);
const width = 1024;
const height = 1024;
const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?seed=${seed}&width=${width}&height=${height}&nologo=true`;

console.log("Fetching:", imageUrl);
fetch(imageUrl)
  .then(res => {
    console.log("Status:", res.status, res.statusText);
    return res.arrayBuffer();
  })
  .then(buffer => {
    console.log("Buffer size:", buffer.byteLength);
  })
  .catch(err => console.error("Error:", err));
