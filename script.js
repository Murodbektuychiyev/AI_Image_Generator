const btn = document.getElementById("generate");
const img = document.getElementById("result");
const loader = document.getElementById("loader");
const downloadBtn = document.getElementById("download");
const input = document.getElementById("prompt");

btn.addEventListener("click", async () => {
    const promptText = input.value.trim();
    if (!promptText) return alert("Please enter a prompt!");

    // State: Loading
    btn.disabled = true;
    btn.innerText = "Processing...";
    img.style.display = "none";
    downloadBtn.style.display = "none";
    loader.style.display = "block";

    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?seed=${seed}&width=1024&height=1024&nologo=true`;

    img.src = url;

    img.onload = () => {
        loader.style.display = "none";
        img.style.display = "block";
        downloadBtn.style.display = "inline-block";
        btn.disabled = false;
        btn.innerText = "Generate";
    };
});

downloadBtn.addEventListener("click", async () => {
    const response = await fetch(img.src);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "ai-generated-image.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
