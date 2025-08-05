const toggle = document.getElementById('toggle');
const labelText = document.getElementById('labelText');
const statusText = document.getElementById('statusText');

function updateUI(isEnabled) {
  labelText.textContent = isEnabled ? "Don't be a Dashhole" : "Be a Dashhole";
  statusText.textContent = isEnabled
    ? "Hyphens activated. Death to em dashes."
    : "Em dashes will survive... for now.";
}

chrome.storage.sync.get(["enabled"], (result) => {
  const enabled = result.enabled ?? true;
  toggle.checked = enabled;
  updateUI(enabled);
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ enabled });
  updateUI(enabled);
});
