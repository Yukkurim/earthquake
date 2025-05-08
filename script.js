// 地震情報の取得
function fetchEarthquakeData() {
  fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson')
    .then(response => response.json())
    .then(data => {
      const earthquake = data.features[0];
      const lat = earthquake.geometry.coordinates[1];
      const lon = earthquake.geometry.coordinates[0];
      const magnitude = earthquake.properties.mag;
      const title = earthquake.properties.title;
      const updated = earthquake.properties.updated;

      // 地図にマーカーを追加
      const map = L.map('map').setView([35.6762, 139.6503], 5); // 日本（東京）の緯度・経度に設定
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      L.marker([lat, lon]).addTo(map)
        .bindPopup(`<strong>${title}</strong><br>Magnitude: M${magnitude}<br>${new Date(updated).toLocaleString()}`)
        .openPopup();

      // 履歴に保存
      saveEarthquakeHistory(lat, lon, title, magnitude, updated);
    })
    .catch(error => console.log('Error fetching data:', error));
}

// 履歴保存
function saveEarthquakeHistory(lat, lon, title, magnitude, updated) {
  const history = JSON.parse(localStorage.getItem('earthquake-history')) || [];
  history.unshift({ lat, lon, title, magnitude, updated });
  localStorage.setItem('earthquake-history', JSON.stringify(history));
  renderHistory();
}

// 履歴表示
function renderHistory() {
  const history = JSON.parse(localStorage.getItem('earthquake-history')) || [];
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = '';
  history.forEach((eq, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <button onclick="replayEarthquake(${index})">再現</button>
      ${new Date(eq.updated).toLocaleString()} - ${eq.title} (M${eq.magnitude})
    `;
    historyList.appendChild(li);
  });
}

// 再現機能
function replayEarthquake(index) {
  const history = JSON.parse(localStorage.getItem('earthquake-history')) || [];
  const eq = history[index];
  if (eq) {
    const lat = eq.lat;
    const lon = eq.lon;
    const title = eq.title;
    const magnitude = eq.magnitude;
    const updated = eq.updated;

    // 地図に再表示
    const map = L.map('map').setView([lat, lon], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    L.marker([lat, lon]).addTo(map)
      .bindPopup(`<strong>${title}</strong><br>Magnitude: M${magnitude}<br>${new Date(updated).toLocaleString()}`)
      .openPopup();
  }
}

// 音声通知設定
document.getElementById('sound-toggle').addEventListener('change', (event) => {
  const isChecked = event.target.checked;
  localStorage.setItem('sound-notification', isChecked);
});

// 音声通知を再生
function playSound() {
  if (JSON.parse(localStorage.getItem('sound-notification'))) {
    const audio = new Audio('https://www.soundjay.com/button/beep-07.wav');
    audio.play();
  }
}

// 初回データ取得
fetchEarthquakeData();

// 履歴をレンダリング
renderHistory();
