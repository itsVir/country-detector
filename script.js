let countries = [];
let dialCodeMap = new Map();

const dialInput = document.getElementById("dialInput");
const numberInput = document.getElementById("numberInput");
const result = document.getElementById("result");
const detectBtn = document.querySelector("button");
const spinner = document.getElementById("spinner");

detectBtn && (detectBtn.disabled = true);
detectBtn && (detectBtn.innerText = "Loading...");

// Helper to normalize dial codes: keep +, then digits only
function normalizeDialCode(code) {
  return code.replace(/[^\d+]/g, "");
}

fetch("countries.json")
  .then((res) => res.json())
  .then((data) => {
    countries = data.sort((a, b) => b.dial_code.length - a.dial_code.length);
    countries.forEach((c) => {
      dialCodeMap.set(normalizeDialCode(c.dial_code), c);
    });
    detectBtn && (detectBtn.disabled = false);
    detectBtn && (detectBtn.innerText = "Detect");
    detect();
  });

function validateDial(dialRaw) {
  return /^\d{1,5}$/.test(dialRaw);
}
function validateNumber(number) {
  return /^\d{4,15}$/.test(number);
}

function detect() {
  if (spinner) spinner.style.display = "block";
  const dialRaw = dialInput.value.trim();
  const number = numberInput.value.trim();

  // Validate dial code
  if (!validateDial(dialRaw)) {
    dialInput.style.borderColor = "#e17055";
    numberInput.style.borderColor = "";
    result.innerHTML =
      '<span style="color:#e17055;">❌ Please enter a valid dial code (1-5 digits).</span>';
    if (spinner) spinner.style.display = "none";
    return;
  } else {
    dialInput.style.borderColor = "";
  }

  // Normalize user input to match normalized dial codes
  const dial = normalizeDialCode("+" + dialRaw.replace(/\D/g, ""));
  const match = dialCodeMap.get(dial);

  if (!match) {
    result.innerHTML = "❌ Dial code not recognized.";
    if (spinner) spinner.style.display = "none";
    return;
  }

  // If number is empty, show only country info
  if (!number) {
    numberInput.style.borderColor = "";
    const flagUrl = `https://flagcdn.com/96x72/${match.code.toLowerCase()}.png`;
    result.innerHTML = `
      <img src="${flagUrl}" alt="${match.name} Flag" style="width:96px;height:72px;margin-bottom:10px;" /><br>
      ✅ <strong>Country:</strong> ${match.name} (${match.code})<br>
      <span style='color:#888;'>Enter number for full result</span>
    `;
    if (spinner) spinner.style.display = "none";
    return;
  }

  // Validate number
  if (!validateNumber(number)) {
    numberInput.style.borderColor = "#e17055";
    result.innerHTML =
      '<span style="color:#e17055;">❌ Please enter a valid number (4-15 digits).</span>';
    if (spinner) spinner.style.display = "none";
    return;
  } else {
    numberInput.style.borderColor = "";
  }

  // Show full result
  const fullNumber = `${dial}${number}`;
  const flagUrl = `https://flagcdn.com/96x72/${match.code.toLowerCase()}.png`;
  result.innerHTML = `
    <img src="${flagUrl}" alt="${match.name} Flag" style="width:96px;height:72px;margin-bottom:10px;" /><br>
    ✅ <strong>Country:</strong> ${match.name} (${match.code})<br>
    📞 <strong>Full Number:</strong> ${fullNumber}
  `;
  if (spinner) spinner.style.display = "none";
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
