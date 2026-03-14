#include "SDStore.h"

// Define static members
QueueHandle_t SDStore::_logQueue;
bool SDStore::_isMounted = false;
bool SDStore::_isSyncing = false;

void SDStore::begin() {
    // 1. Explicitly start SPI on the S3 pins defined in SharedData.h
    SPI.begin(SD_SCK, SD_MISO, SD_MOSI, SD_CS);
    
    // 2. Try to mount SD Card
    if (!SD.begin(SD_CS)) {
        Serial.println("❌ SD Mount Failed! Offline storage disabled.");
        _isMounted = false;
    } else {
        Serial.println("✅ SD Card Mounted.");
        _isMounted = true;
        
        // 3. Create CSV Header if file is new
        if (!SD.exists(LOG_FILENAME)) {
            File f = SD.open(LOG_FILENAME, FILE_WRITE);
            if (f) {
                f.println("Timestamp,T1,H1,S1,G1,T2,H2,S2,G2,Peltier");
                f.close();
            }
        }
    }

    // 4. Create the FreeRTOS Queue (Buffer)
    _logQueue = xQueueCreate(MAX_QUEUE_SIZE, sizeof(LogEntry));

    // 5. Start the Background Task on Core 0
    xTaskCreatePinnedToCore(
        sdTask,      // Function to run
        "SDWriter",  // Task Name
        8192,        // Stack Size (8KB)
        NULL,        // Parameter
        1,           // Priority (Low)
        NULL,        // Handle
        0            // Core 0 (Background)
    );
}

void SDStore::enqueueLog(LogEntry entry) {
    if (!_isMounted) return;
    
    // Push to queue. Wait 0ms. If full, we drop the log (better than crashing).
    if (xQueueSend(_logQueue, &entry, 0) != pdTRUE) {
        Serial.println("⚠️ SD Queue Full - Dropping log!");
    }
}

// === BACKGROUND TASK ===
// This runs on Core 0 and waits for data to arrive in the queue
void SDStore::sdTask(void* parameter) {
    LogEntry entry;
    for (;;) {
        // Block here until data arrives
        if (xQueueReceive(_logQueue, &entry, portMAX_DELAY) == pdPASS) {
            writeLogLine(entry);
        }
    }
}

void SDStore::writeLogLine(LogEntry& entry) {
    if (_isSyncing) return; // Pause writing if we are currently uploading

    File f = SD.open(LOG_FILENAME, FILE_APPEND);
    if (!f) {
        Serial.println("❌ SD Write Error");
        return;
    }

    // Write CSV format
    f.printf("%s,%.1f,%.1f,%d,%d,%.1f,%.1f,%d,%d,%d\n",
             entry.timestamp,
             entry.temp1, entry.hum1, entry.soil1, entry.gas1,
             entry.temp2, entry.hum2, entry.soil2, entry.gas2,
             entry.peltierState);
    f.close();
    Serial.println("💾 Logged to SD: " + String(entry.timestamp));
}

// === BATCH SYNC LOGIC ===
void SDStore::handleSync(PubSubClient& client) {
    if (!_isMounted || _isSyncing) return;
    
    // Only sync if file exists and has data (simple size check)
    if (!SD.exists(LOG_FILENAME)) return;
    File check = SD.open(LOG_FILENAME, FILE_READ);
    if (!check || check.size() < 50) { // <50 bytes means just header or empty
        check.close();
        return;
    }
    check.close();

    Serial.println("🔄 Starting Batch Sync...");
    _isSyncing = true;

    // Rename current log to "buffer" so we can upload it safely
    // while new logs start a fresh file.
    SD.rename(LOG_FILENAME, SYNC_FILENAME);
    
    // Create new fresh log file immediately
    File newLog = SD.open(LOG_FILENAME, FILE_WRITE);
    if (newLog) {
        newLog.println("Timestamp,T1,H1,S1,G1,T2,H2,S2,G2,Peltier");
        newLog.close();
    }

    processBatchUpload(client);

    _isSyncing = false;
}

void SDStore::processBatchUpload(PubSubClient& client) {
    File f = SD.open(SYNC_FILENAME, FILE_READ);
    if (!f) return;

    // Read & Ignore Header Line
    f.readStringUntil('\n');

    StaticJsonDocument<4096> doc;
    JsonArray logs = doc.createNestedArray("logs");
    int count = 0;

    while (f.available()) {
        String line = f.readStringUntil('\n');
        line.trim();
        if (line.length() < 10) continue; // Skip empty lines

        logs.add(line); // Add CSV line to JSON array
        count++;

        // If we reached Batch Size (10), Publish!
        if (count >= BATCH_SIZE) {
            String payload;
            serializeJson(doc, payload);
            
            if (client.publish("avonic/sensor/sync", payload.c_str())) {
                Serial.printf("📤 Synced batch of %d logs\n", count);
                client.loop(); // Keep MQTT alive
            } else {
                Serial.println("❌ Sync Publish Failed!");
            }

            // Clear JSON for next batch
            doc.clear();
            logs = doc.createNestedArray("logs");
            count = 0;
            delay(50); // Small delay for stability
        }
    }

    // Publish any remaining logs
    if (count > 0) {
        String payload;
        serializeJson(doc, payload);
        client.publish("avonic/sensor/sync", payload.c_str());
        Serial.printf("📤 Synced final batch of %d logs\n", count);
    }

    f.close();
    SD.remove(SYNC_FILENAME); // Delete buffer after upload
    Serial.println("✅ Sync Complete!");
}