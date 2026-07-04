const btn = document.getElementById("generate");
const img = document.getElementById("result");
const loader = document.getElementById("loader");
const downloadBtn = document.getElementById("download");
const input = document.getElementById("prompt");
const aspectRatioSelect = document.getElementById("aspect-ratio");
const styleTags = document.querySelectorAll(".style-tag");
const historyGallery = document.getElementById("history-gallery");

let selectedStyle = "";

// 1. Style Tags Handler (Uslub tugmalarini boshqarish)
styleTags.forEach(tag => {
    tag.addEventListener("click", () => {
        // Agar o'sha tugma allaqachon tanlangan bo'lsa, tanlovni olib tashlaymiz
        if (tag.classList.contains("active")) {
            tag.classList.remove("active");
            selectedStyle = "";
        } else {
            // Aks holda boshqa aktiv tugmalardan klassni olib, bunga qo'shamiz
            styleTags.forEach(t => t.classList.remove("active"));
            tag.classList.add("active");
            selectedStyle = tag.getAttribute("data-style");
        }
    });
});

// 2. Aspect Ratio mapper (O'lchamlarni aniqlash)
function getDimensions(ratio) {
    switch(ratio) {
        case "16:9": return { width: 1280, height: 720 };
        case "9:16": return { width: 720, height: 1280 };
        default: return { width: 1024, height: 1024 }; // 1:1 format
    }
}

// 3. Generate Image Function
btn.addEventListener("click", async () => {
    const rawPrompt = input.value.trim();
    if (!rawPrompt) return alert("Please enter a prompt!");

    // State: Loading
    btn.disabled = true;
    btn.innerText = "Processing...";
    img.style.display = "none";
    downloadBtn.style.display = "none";
    loader.style.display = "block";

    // Promptni tanlangan uslub bilan boyitish (Enhance Style)
    const finalPrompt = selectedStyle ? `${rawPrompt}, ${selectedStyle}` : rawPrompt;
    
    // O'lchamlarni hisoblash (Aspect Ratio)
    const { width, height } = getDimensions(aspectRatioSelect.value);
    const seed = Math.floor(Math.random() * 1000000);
    
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?seed=${seed}&width=${width}&height=${height}&nologo=true`;

    img.src = url;

    img.onload = () => {
        loader.style.display = "none";
        img.style.display = "block";
        downloadBtn.style.display = "inline-block";
        btn.disabled = false;
        btn.innerText = "Generate";
        
        // Tarixga saqlash funksiyasini chaqiramiz
        saveToHistory(url, rawPrompt);
    };
});

// 4. Download Image Function
downloadBtn.addEventListener("click", async () => {
    try {
        const response = await fetch(img.src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-vision-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert("Failed to download image. Try right-clicking and saving it manually!");
    }
});

// 5. LocalStorage History Functions (Tarix Galereyasi)
function saveToHistory(url, promptText) {
    let history = JSON.parse(localStorage.getItem("ai_history")) || [];
    
    // Bir xil rasmlar takrorlanmasligi uchun tekshiramiz
    if (!history.some(item => item.url === url)) {
        // Yangi rasmni ro'yxat boshiga qo'shamiz
        history.unshift({ url, prompt: promptText });
        // Maksimal 6 ta rasmni saqlab turamiz
        if (history.length > 6) history.pop();
        
        localStorage.setItem("ai_history", JSON.stringify(history));
        renderHistory();
    }
}

function renderHistory() {
    historyGallery.innerHTML = "";
    const history = JSON.parse(localStorage.getItem("ai_history")) || [];
    
    if (history.length === 0) {
        historyGallery.innerHTML = "<p class='no-history'>No recent generations yet.</p>";
        return;
    }

    history.forEach(item => {
        const card = document.createElement("div");
        card.className = "history-card";
        card.innerHTML = `
            <img src="${item.url}" alt="${item.prompt}" title="${item.prompt}">
            <div class="history-overlay">
                <button onclick="loadHistoryImage('${item.url}')">View</button>
            </div>
        `;
        historyGallery.appendChild(card);
    });
}

// Tarixdagi rasmni asosiy ekranga qayta yuklash tugmasi uchun
window.loadHistoryImage = function(url) {
    img.src = url;
    img.style.display = "block";
    downloadBtn.style.display = "inline-block";
    window.scrollTo({ top: img.offsetTop - 50, behavior: 'smooth' });
};

// Sayt yuklanganda tarixni ekranga chiqaramiz
document.addEventListener("DOMContentLoaded", renderHistory);
