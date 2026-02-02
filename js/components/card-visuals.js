// ========================================
// 📊 CARD VISUAL SYSTEM (Circle Progress & Value Updates)
// ========================================

const radius = 19;
const circumference = 2 * Math.PI * radius;

function setCardValue(card, value) {
  const max = parseFloat(card.dataset.max) || 100;
  const unit = card.dataset.unit || "%";

  const valueElem = card.querySelector(".card_value");
  const unitElem = card.querySelector(".card_unit");
  const circle = card.querySelector(".card_progress");
  const message = card.querySelector(".status-message");
  const subLabel = card.querySelector(".sub_status_label");

  // Set value text
  valueElem.innerText = value.toFixed();
  unitElem.innerText = unit;

  // Progress circle math
  const percent = Math.min(value / max, 1);
  const offset = circumference - percent * circumference;
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = offset;

  // === Determine color + status ===
  let color = "";
  let statusText = "";

  if (card.dataset.type === "water-tank") {
    if (value < max * 0.33) {
      color = "#df5e45ff"; // red
      statusText = "Water low, refill tank";
    } else if (value < max * 0.66) {
      color = "#d5df45ff"; // orange
      statusText = "Medium Capacity";
    } else {
      color = "#45df8aff"; // green
      statusText = "Full Capacity";
    }
  }

  if (card.dataset.type === "water-temp") {
    if (value < max * 0.33) {
      color = "#456edfff";  
      statusText = "Water is Cold";
    } else if (value < max * 0.66) {
      color = "#d5df45ff"; // orange
      statusText = "Water is Warm";
    } else {
      color = "#df4545ff";   
      statusText = "Room Temperature";
    }
  }

  if (card.dataset.type === "battery") {
    if (value < max * 0.33) {
      color = "#df5e45ff"; // red
      statusText = "Low Battery, Please Charge";
    } else if (value < max * 0.66) {
      color = "#d5df45ff"; // orange
      statusText = "Medium Capacity";
    } else {
      color = "#45df8aff"; // green
      statusText = "Full Charged";
    }
  }

  if (card.dataset.type === "Sensors") {
    if (value < max * 0.33) {
      color = "#df5e45ff"; // red
      statusText = "Low";
    } else if (value < max * 0.66) {
      color = "#4A6C59"; // green
      statusText = "Stable";
    } else {
      color = "#df5e45ff"; // red again
      statusText = "Critical";
    }
  }

  // Apply styles
  if (color) {
    circle.style.stroke = color;
    if (message) {
      message.style.backgroundColor = color;
      message.style.color = "#fff";
    }
  }

  // Sync modal if open
  const modal = document.querySelector(".status_modal");
  if (modal) {
    const readingsBox = modal.querySelector(".readings");
    const modalValue = modal.querySelector(".card_value_v2");
    const modalUnit = modal.querySelector(".card_unit_v2");
    const sensorStatus = modal.querySelector(".sensorStatus");

     if (modalValue && modalUnit && sensorStatus && readingsBox) {
      modalValue.innerText = value.toFixed();
      modalUnit.innerText = unit;
      sensorStatus.innerText = statusText;

      // Background color logic
      readingsBox.style.backgroundColor = color;
      readingsBox.style.color = "#fff";
      sensorStatus.style.backgroundColor = color;
      sensorStatus.style.color = "#fff";
    }
  }

  // Update the placeholder text for subDataLabel
  if (subLabel) subLabel.innerText = statusText;
}

// === Refresh function ===
function refreshReading(card) {
  const max = parseFloat(card.dataset.max) || 100;
  const newValue = Math.random() * max;
  setCardValue(card, newValue);
}

// === Init + event binding ===
document.querySelectorAll(".card_stats").forEach(card => {
  const refreshBtn = card.querySelector(".refresh_btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => refreshReading(card));
  }
  
  // Initialize with "--" instead of random values
  const valueElem = card.querySelector(".card_value");
  const unitElem = card.querySelector(".card_unit");
  if (valueElem) valueElem.textContent = '--';
  if (unitElem) unitElem.textContent = '';
});

// === Refresh Sensors Button ===
document.addEventListener('DOMContentLoaded', () => {
  const refreshButton = document.querySelector(".refresh-sensors");
  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      // Let data_integration.js handle the refresh
      if (typeof fetchSensorData === 'function') {
        fetchSensorData();
      }
      
      const timeElem = document.querySelector(".time-updated");
      if (timeElem) {
        timeElem.textContent = "Refreshing...";
        timeElem.style.opacity = "1"; 
        setTimeout(() => {
          timeElem.textContent = "Updated just now";
        }, 500);
      }
    });
  }
});

console.log('✅ Card visuals system loaded');