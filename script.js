let countries = [];
let dialCodeMap = new Map();

const dialInput = document.getElementById("dialInput");
const numberInput = document.getElementById("numberInput");
const result = document.getElementById("result");
const detectBtn = document.querySelector("button");

detectBtn.disabled = true;
detectBtn.innerText = "Loading...";

fetch("countries.json")
  .then((res) => res.json())
  .then((data) => {
    countries = data.sort((a, b) => b.dial_code.length - a.dial_code.length);
    countries.forEach((c) => dialCodeMap.set(c.dial_code, c));
    detectBtn.disabled = false;
    detectBtn.innerText = "Detect";
    detect(); // Show result if fields are prefilled
  });

function detect() {
  const dialRaw = dialInput.value.trim();
  const number = numberInput.value.trim();
  const dial = "+" + dialRaw.replace(/\D/g, "");
  const match = dialCodeMap.get(dial);

  let output = "";
  if (!match) {
    output = "❌ Dial code not recognized.";
  } else {
    const fullNumber = `${dial}${number}`;
    const flagUrl = `https://flagcdn.com/96x72/${match.code.toLowerCase()}.png`;
    output = `
      <img src="${flagUrl}" alt="${match.name} Flag" style="width:96px;height:72px;margin-bottom:10px;" /><br>
      ✅ <strong>Country:</strong> ${match.name} (${match.code})<br>
      📞 <strong>Full Number:</strong> ${fullNumber}
    `;
  }
  if (result.innerHTML !== output) {
    result.innerHTML = output;
  }
}

// Debounce for fast typing
let debounceTimer;
dialInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(detect, 150);
});
numberInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(detect, 150);
});
