#ifndef SDSTORE_H
#define SDSTORE_H

#include <Arduino.h>
#include <SD.h>
#include <SPI.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include "SharedData.h"

// Configuration
#define MAX_QUEUE_SIZE 50
#define LOG_FILENAME "/log.csv"
#define SYNC_FILENAME "/sync_buffer.csv"
#define BATCH_SIZE 10

class SDStore {
public:
    static void begin();
    static void enqueueLog(LogEntry entry);
    static void handleSync(PubSubClient& client);

private:
    static void sdTask(void* parameter);
    static void writeLogLine(LogEntry& entry);
    static void processBatchUpload(PubSubClient& client);
    
    static QueueHandle_t _logQueue;
    static bool _isMounted;
    static bool _isSyncing;
};

#endif