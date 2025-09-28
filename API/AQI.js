// WARNING: if you host on GitHub Pages this token is public (visible in browser).
const token = "479b7ce6a992e2f921ea11ec1482acc0d113ba1c";

async function showPrecautions() {
  const location = document.getElementById("location-input").value.trim();
  const outputDiv = document.getElementById("precautions-output");

  if (!location) {
    outputDiv.innerHTML = "<strong>Please select a city.</strong>";
    outputDiv.style.display = "block";
    return;
  }

  try {
    const resp = await fetch(
      `https://api.waqi.info/feed/${encodeURIComponent(location)}/?token=${token}`
    );
    const data = await resp.json();

    if (!data || data.status !== "ok" || !data.data) {
      throw new Error("No live AQI found");
    }

    const aqi = data.data.aqi ?? 0;

    // AQI Level mapping
    let aqiLevel = "", aqiColor = "";
    if (aqi <= 50) { aqiLevel = "Good"; aqiColor = "green"; }
    else if (aqi <= 100) { aqiLevel = "Moderate"; aqiColor = "#f59e0b"; }
    else if (aqi <= 150) { aqiLevel = "Unhealthy for Sensitive Groups"; aqiColor = "orange"; }
    else if (aqi <= 200) { aqiLevel = "Unhealthy"; aqiColor = "red"; }
    else if (aqi <= 300) { aqiLevel = "Very Unhealthy"; aqiColor = "purple"; }
    else { aqiLevel = "Hazardous"; aqiColor = "maroon"; }

    // Precautions (same logic you had)
    let precautions = [];
    if (aqi <= 50) {
      precautions = ["Enjoy outdoor activities freely."];
    } else if (aqi <= 100) {
      precautions = ["Sensitive groups should limit long outdoor exertion."];
    } else if (aqi <= 150) {
      precautions = [
        "Children, elderly, and asthma patients should wear masks outdoors.",
        "Avoid jogging near traffic-heavy areas."
      ];
    } else if (aqi <= 200) {
      precautions = [
        "Limit outdoor exposure.",
        "Wear an N95 mask outside.",
        "Use indoor air purifiers."
      ];
    } else if (aqi <= 300) {
      precautions = [
        "Stay indoors as much as possible.",
        "Keep windows closed.",
        "Avoid physical activity outdoors."
      ];
    } else {
      precautions = [
        "Emergency situation: Avoid going outside.",
        "Sensitive groups should relocate if possible."
      ];
    }

    outputDiv.innerHTML = `
      <h3>Live AQI for ${location}:</h3>
      <p><strong>AQI:</strong> <span style="color:${aqiColor}; font-weight:bold;">${aqi} (${aqiLevel})</span></p>
      <ul>${precautions.map(p => `<li>${p}</li>`).join("")}</ul>
    `;
  } catch (e) {
    console.error("AQI fetch error:", e);
    outputDiv.innerHTML = `<h3>⚠️ Error fetching live data for "${location}".</h3>`;
  }

  outputDiv.style.display = "block";
}
