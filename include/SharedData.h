#ifndef SHARED_DATA_H
#define SHARED_DATA_H

#include <Arduino.h>

// ====== DATA STRUCTURES ======
// These act as the "contract" between Master, Slave, and SD Card.

struct SensorData {
  float temp;
  float humidity;
  int soil_percent;
  int gas_ppm;
  float ds18b20_temp;
  long ultrasonic_distance;
  int water_level;
  
  // Actuator states
  bool intake_fan_state;
  bool exhaust_fan_state;
  bool pump_state;
  
  // Status strings (fixed size for binary safety)
  char intake_fan_status[20];
  char exhaust_fan_status[20];
  char pump_status[20];
};

struct PeltierData {
  bool peltier_main_state;
  bool peltier_pump_state;
  char peltier_main_status[20];
  char peltier_pump_status[20];
};

// Wrapper for the SD Queue
struct LogEntry {
    char timestamp[25]; // e.g. "2023-10-27T10:00:00Z"
    
    // Flattened data for easier CSV writing
    float temp1;
    float hum1;
    int soil1;
    int gas1;
    
    float temp2;
    float hum2;
    int soil2;
    int gas2;
    
    bool peltierState;
};

// ====== HARDWARE PINS (ESP32-S3) ======
// We define these here so the SDStore can access them
#define SD_SCK  12
#define SD_MISO 13
#define SD_MOSI 11
#define SD_CS   10

#endif