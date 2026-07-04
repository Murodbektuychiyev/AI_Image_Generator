// Dom elementlarini tanlab olamiz
const actionBtn = document.getElementById("generate");
const previewImg = document.getElementById("result");
const mainLoader = document.getElementById("loader");
const saveFileBtn = document.getElementById("download");
const promptInput = document.getElementById("prompt");
const sizeSelector = document.getElementById("aspect-ratio");
const galleryGrid = document.getElementById("history-gallery");

let myActiveStyle = "";

// 1. Stil tanlash qismi (.style-btn klassi bilan)
document.querySelectorAll(".style-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("selected")) {
      btn.classList.remove("selected");
      myActiveStyle = "";
    } else {
      document
        .querySelectorAll(".style-btn")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      myActiveStyle = btn.getAttribute("data-style");
    }
  });
});

// 2. Rasm o'lchamlarini aniqlash funksiyasi
function calculateSize(ratio) {
  if (ratio === "16:9") return { w: 1280, h: 720 };
  if (ratio === "9:16") return { w: 720, h: 1280 };
  return { w: 1024, h: 1024 };
}

// 3. Rasmni generatsiya qilish (Pollinations API)
actionBtn.addEventListener("click", async () => {
  const textValue = promptInput.value.trim();
  if (!textValue) {
    alert("Please enter a prompt first!");
    return;
  }

  // UI holatini o'zgartiramiz (Loading state)
  actionBtn.disabled = true;
  actionBtn.innerText = "Creating...";
  previewImg.style.display = "none";
  saveFileBtn.style.display = "none";
  mainLoader.style.display = "block";

  // Prompt va o'lcham tayyorlash
  const fullPrompt = myActiveStyle
    ? `${textValue}, ${myActiveStyle}`
    : textValue;
  const size = calculateSize(sizeSelector.value);
  const randomSeed = Math.floor(Math.random() * 999999);

  const apiEndpoint = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?seed=${randomSeed}&width=${size.w}&height=${size.h}&nologo=true`;

  previewImg.src = apiEndpoint;

  previewImg.onload = () => {
    mainLoader.style.display = "none";
    previewImg.style.display = "block";
    saveFileBtn.style.display = "inline-block";
    actionBtn.disabled = false;
    actionBtn.innerText = "Generate";

    // LocalStorage tarixiga yuboramiz
    updateLocalHistory(apiEndpoint, textValue);
  };
});

// 4. Rasmni kompyuterga ko'chirib olish (Download)
saveFileBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(previewImg.src);
    const imageBlob = await res.blob();
    const blobUrl = URL.createObjectURL(imageBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = `studio-art-${Date.now()}.jpg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    alert(
      "Couldn't auto-download. Please right-click the image to save it manually!",
    );
  }
});

// 5. LocalStorage bilan ishlash mantiqi
function updateLocalHistory(imgUrl, textPrompt) {
  let savedItems = JSON.parse(localStorage.getItem("studio_history")) || [];

  if (!savedItems.some((item) => item.url === imgUrl)) {
    savedItems.unshift({ url: imgUrl, prompt: textPrompt });

    // Ko'p joy olmasligi uchun faqat 6 ta saqlaymiz
    if (savedItems.length > 6) savedItems.pop();

    localStorage.setItem("studio_history", JSON.stringify(savedItems));
    refreshGallery();
  }
}

function refreshGallery() {
  galleryGrid.innerHTML = "";
  const savedItems = JSON.parse(localStorage.getItem("studio_history")) || [];

  if (savedItems.length === 0) {
    galleryGrid.innerHTML =
      "<p class='empty-text'>Your recent creations will appear here.</p>";
    return;
  }

  savedItems.forEach((item) => {
    const itemWrap = document.createElement("div");
    itemWrap.className = "gallery-item";

    const thumb = document.createElement("img");
    thumb.src = item.url;
    thumb.alt = item.prompt;

    // Rasm bosilganda uni asosiy ekranga chiqarish (Inline event listener)
    thumb.addEventListener("click", () => {
      previewImg.src = item.url;
      previewImg.style.display = "block";
      saveFileBtn.style.display = "inline-block";
      window.scrollTo({ top: previewImg.offsetTop - 60, behavior: "smooth" });
    });

    itemWrap.appendChild(thumb);
    galleryGrid.appendChild(itemWrap);
  });
}

// Sahifa yuklanganda galereyani yangilaymiz
document.addEventListener("DOMContentLoaded", refreshGallery);
