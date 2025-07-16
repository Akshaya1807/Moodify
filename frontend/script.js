async function getRecommendation() {
    const moodInput = document.getElementById("moodInput");
    const moodText = moodInput.value.trim();
    const resultDiv = document.getElementById("result");
  
    resultDiv.innerHTML = "";
    resultDiv.classList.add("hidden");
  
    if (!moodText) {
      resultDiv.innerHTML = `<p style="color: #ff4d4d;">⚠️ Please enter something to describe your mood.</p>`;
      resultDiv.classList.remove("hidden");
      return;
    }
  
    resultDiv.innerHTML = "⏳ Finding the perfect playlist for you...";
    resultDiv.classList.remove("hidden");
   
    
    try {
      const res = await fetch("http://localhost:3000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moodText })
      });
  
      const data = await res.json();
  
      resultDiv.innerHTML = `
        <p>🎧 <strong>Detected Mood:</strong> ${data.detectedMood}</p>
        ${data.image ? `<img src="${data.image}" alt="Playlist Cover">` : ''}
        <p style="margin-top:10px;"><strong>${data.name}</strong></p>
        <a href="${data.url}" target="_blank">▶️ Listen on Spotify</a>
      `;
    } catch (error) {
      resultDiv.innerHTML = `<p style="color:red;">❌ Something went wrong. Please try again.</p>`;
    }
  }
  
  document.getElementById("moodInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      getRecommendation();
    }
  });
  document.getElementById("moodInput").addEventListener("input", () => {
    document.getElementById("result").innerHTML = "";
  });
  
  