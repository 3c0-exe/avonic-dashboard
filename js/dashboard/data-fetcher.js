// dashboard/data-fetcher.js - Dashboard Data Fetcher

/**
 * Fetch real sensor data from API for dashboard charts
 * @param {string} sensorType - Sensor type (temperature, humidity, soilMoisture, gasLevels)
 * @returns {Promise<Object|null>} { labels, values } or null if failed
 */
async function fetchRealSensorData(sensorType) {
    try {
        const token = localStorage.getItem('avonic_token');
        if (!token) {
            console.warn("⚠️ No login token found. Using dummy data.");
            return null;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Get the User's First Device ID
        const deviceRes = await fetch(`${API_BASE}/api/devices/claimed`, { headers });
        const deviceData = await deviceRes.json();

        if (!deviceData.success || deviceData.devices.length === 0) {
            console.warn("⚠️ No devices found for this user.");
            return null;
        }

        const espID = deviceData.devices[0].espID;

        // 2. Fetch Readings for this Device (last 7 readings)
        const readingsRes = await fetch(`${API_BASE}/api/devices/${espID}/readings?limit=7`, { headers });
        const readingsData = await readingsRes.json();

        if (!readingsData.readings || readingsData.readings.length === 0) return null;

        // 3. Filter out invalid records (safety check)
        const validReadings = readingsData.readings.filter(r => r.bin1 !== undefined && r.bin1 !== null);

        if (validReadings.length === 0) return null;

        // 4. Map backend data to chart format
        const processedData = validReadings.map(reading => {
            let val = 0;

            // Sensor mapping with safety checks
            switch(sensorType) {
                case 'temperature':  val = reading.bin1.temp || 0; break;
                case 'humidity':     val = reading.bin1.humidity || 0; break;
                case 'soilMoisture': val = reading.bin1.soil || 0; break;
                case 'gasLevels':    val = reading.bin1.gas || 0; break;
                default: val = 0;
            }

            // Format timestamp
            const date = new Date(reading.timestamp);
            const label = `${date.getMonth() + 1}/${date.getDate()}`;

            return { label, value: val };
        });

        // API returns newest first, charts need oldest first
        processedData.reverse();

        return {
            labels: processedData.map(d => d.label),
            values: processedData.map(d => d.value)
        };

    } catch (error) {
        console.error("❌ Dashboard data fetch error:", error);
        return null;
    }
}

console.log('✅ Dashboard data fetcher loaded');