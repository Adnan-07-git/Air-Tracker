// If you later move to Vercel, replace this with a serverless call and store the key in env vars.
const token = "479b7ce6a992e2f921ea11ec1482acc0d113ba1c";

async function showPrecautions() {
  const locationEl = document.getElementById("location-input");
  const outputDiv = document.getElementById("precautions-output");
  if (!locationEl) return;
  const location = locationEl.value.trim();

  if (!location) {
    outputDiv.innerHTML = "<strong>Please select a city.</strong>";
    outputDiv.style.display = "block";
    return;
  }

  // show loading state
  outputDiv.style.display = "block";
  outputDiv.innerHTML = "<p>Fetching live AQI…</p>";

  try {
    // Direct WAQI call
    const url = `https://api.waqi.info/feed/${encodeURIComponent(location)}/?token=${token}`;
    console.debug("Fetching WAQI:", url);
    const resp = await fetch(url, { cache: "no-store" });

    if (!resp.ok) {
      throw new Error(`Network response not ok (status ${resp.status})`);
    }

    const data = await resp.json();
    // WAQI returns: { status: "ok", data: { aqi: NUMBER, city: { name: "City, Country" }, ... } }
    let aqi = 0;
    let cityName = location;

    if (data && data.status === "ok" && data.data) {
      // some providers return aqi as number or as string like "-" — normalize safely
      const rawAqi = data.data.aqi;
      if (rawAqi !== null && rawAqi !== undefined && !isNaN(Number(rawAqi))) {
        aqi = Number(rawAqi);
      } else {
        aqi = 0;
      }
      if (data.data.city && data.data.city.name) cityName = data.data.city.name;
    } else {
      // no live data - attempt fallback
      console.warn("WAQI responded without usable data:", data);
      if (window.localData && window.localData[location]) {
        aqi = window.localData[location].aqi || 0;
      } else {
        aqi = 0;
      }
    }

    // Determine level & color
    let aqiLevel = "", aqiColor = "";
    if (aqi <= 50) { aqiLevel = "Good"; aqiColor = "green"; }
    else if (aqi <= 100) { aqiLevel = "Moderate"; aqiColor = "#f59e0b"; }
    else if (aqi <= 150) { aqiLevel = "Unhealthy for Sensitive Groups"; aqiColor = "orange"; }
    else if (aqi <= 200) { aqiLevel = "Unhealthy"; aqiColor = "red"; }
    else if (aqi <= 300) { aqiLevel = "Very Unhealthy"; aqiColor = "purple"; }
    else { aqiLevel = "Hazardous"; aqiColor = "maroon"; }

    // Precautions
    let precautions = [];
    // if we have fallback localData with custom precautions, start from that
    if (window.localData && window.localData[location] && Array.isArray(window.localData[location].precautions)) {
      precautions = window.localData[location].precautions.slice();
    }
    // override with dynamic suggestions if we have a numeric aqi > 0
    if (aqi > 0) {
      if (aqi <= 50) { precautions = ["Enjoy outdoor activities freely."]; }
      else if (aqi <= 100) { precautions = ["Sensitive groups should limit long outdoor exertion."]; }
      else if (aqi <= 150) {
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
    }

    // Render
    outputDiv.innerHTML = `
      <h3>Live AQI for ${escapeHtml(cityName)}:</h3>
      <p><strong>AQI:</strong> <span style="color:${aqiColor}; font-weight:bold;">${aqi} (${escapeHtml(aqiLevel)})</span></p>
      <ul>${precautions.map(p => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
    `;
  } catch (err) {
    console.error("showPrecautions error:", err);
    // If fetch fails, show fallback if available, otherwise show message
    const fallback = (window.localData && window.localData[location]) || { aqi: 0, precautions: ["No data available"] };
    outputDiv.innerHTML = `<h3>Live data not found. Showing fallback:</h3>
      <p><strong>AQI:</strong> ${fallback.aqi}</p>
      <ul>${(fallback.precautions || ["No data"]).map(p => `<li>${escapeHtml(p)}</li>`).join("")}</ul>`;
  }

  outputDiv.style.display = "block";
}

// small helper to avoid inserting raw HTML from API (defensive)
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function(m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
}

/* ===== Tips (rotator) ===== */
const tips = [
  "Indoor plants like peace lilies, spider plants, and snake plants can help improve air quality by absorbing pollutants.",
  "Switching to public transport can cut your personal carbon footprint by up to 30%.",
  "Keeping windows closed during high pollution days helps reduce indoor exposure.",
  "Staying hydrated helps your body flush out pollution-related toxins.",
  "Air purifiers with HEPA filters can reduce indoor pollutants like dust, pollen, and smoke.",
  "Carpooling with friends or colleagues reduces both traffic congestion and air pollution.",
  "Burning candles and incense indoors can significantly worsen indoor air quality.",
  "Using an exhaust fan while cooking helps remove harmful gases like nitrogen dioxide.",
  "Electric vehicles produce zero tailpipe emissions, improving urban air quality.",
  "Household dust can carry pollutants—regular vacuuming with a HEPA filter helps reduce it.",
  "Children and the elderly are more vulnerable to poor air quality—extra precautions are important.",
  "Reducing meat consumption can lower methane and greenhouse gas emissions linked to livestock farming.",
  "Pollution levels are usually lower after heavy rainfall, as rain washes particulates from the air.",
  "Smog tends to be worst on sunny, hot days when pollutants react with sunlight.",
  "Switching to energy-efficient appliances reduces emissions from power plants.",
  "Volatile Organic Compounds (VOCs) from paints and cleaners contribute to indoor air pollution.",
  "Second-hand smoke releases hundreds of toxic chemicals into the air, even indoors.",
  "Short trips pollute the most—walking or cycling for local errands makes a big difference.",
  "Idling your car engine for more than 10 seconds wastes fuel and adds unnecessary pollution.",
  "Air quality often improves significantly in early mornings and late nights due to lower traffic.",
  "Trees not only provide oxygen but also trap dust and absorb harmful gases.",
  "Avoid using diesel generators whenever possible—they release large amounts of particulate matter.",
  "Switching to renewable energy sources like solar and wind improves both climate and air quality.",
  "Poor ventilation indoors can trap pollutants—open windows on low-pollution days.",
  "Air quality inside vehicles can sometimes be worse than outside due to trapped emissions.",
  "Wood-burning stoves release fine particulate matter, which can be harmful to lungs.",
  "High-efficiency furnace and AC filters help trap indoor air pollutants.",
  "Walking on quieter side streets can reduce your pollution exposure by up to 60%.",
  "Fine particles (PM2.5) are so small they can enter the bloodstream through your lungs."
];

let usedTips = [], currentTip = "";
function getRandomTip(){
  if(usedTips.length === tips.length) usedTips = [];
  let t;
  do { t = tips[Math.floor(Math.random()*tips.length)]; } while(t === currentTip || usedTips.includes(t));
  usedTips.push(t); currentTip = t; return t;
}
function showNextTip(){
  const tipBox = document.getElementById("tip-box");
  if(!tipBox) return;
  tipBox.style.opacity = 0;
  setTimeout(()=>{ tipBox.textContent = getRandomTip(); tipBox.style.opacity = 1; }, 300);
}
window.addEventListener("DOMContentLoaded", ()=>{ showNextTip(); setInterval(showNextTip, 10000); });
