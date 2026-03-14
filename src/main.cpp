#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include "RTClib.h"
#include <SPI.h>
#include <SD.h>
#include "LittleFS.h"
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <WiFiManager.h>  
#include "SharedData.h"  // Contains SensorData & PeltierData structs
#include "SDStore.h"     // Contains the new logging engine
#define BOOT_PIN 0 // The pin used to trigger a WiFi settings reset
// Add these includes at the top
#include <ArduinoJson.h>
#include <mbedtls/md.h>
#include <HTTPClient.h>

// ====== Authentication & State Management ======
enum DeviceState {
  STATE_WIFI_SETUP,     // ✅ FIRST: WiFi configuration
  STATE_CHECK_BACKEND,  // ✅ NEW: Check for online registration
  STATE_OPERATIONAL     // Normal operation (login required)
};

DeviceState currentState = STATE_WIFI_SETUP;
bool isUserLoggedIn = false;
String loggedInUsername = "";

// File paths
const char* USER_CREDS_FILE = "/user_creds.json";
const char* DEVICE_STATE_FILE = "/device_state.json";

// Your backend API endpoint (change this to your actual backend)
const char* BACKEND_API = "avonic-main-hub-production.up.railway.app";

// ====== Rate Limiting Configuration ======
struct RateLimitEntry {
  String ip;
  unsigned long firstAttempt;
  int attemptCount;
};

// ====== Serial Communication ======
#define SERIAL_COMM Serial2
#define RX2_PIN 16  // Slave TX connects here
#define TX2_PIN 17  // Slave RX connects here
#define START_MARKER_1 0xA5
#define START_MARKER_2 0x5A
#define START_MARKER_3 0xF0
#define END_MARKER 0x7F
String deviceID = "";  // Device unique identifier


// ==== MQTT Broker ====
const char* mqtt_server = "3fbd52903d154a689cae6941ba13bfcf.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "avonic-system";
const char* mqtt_pass = "Avonic123";

const char* root_ca = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw\n" \
"TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh\n" \
"cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4\n" \
"WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu\n" \
"ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY\n" \
"MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc\n" \
"h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+\n" \
"0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U\n" \
"A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW\n" \
"T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH\n" \
"B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC\n" \
"B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv\n" \
"KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn\n" \
"OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn\n" \
"jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw\n" \
"qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI\n" \
"rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV\n" \
"HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq\n" \
"hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL\n" \
"ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ\n" \
"3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK\n" \
"NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5\n" \
"ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur\n" \
"TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC\n" \
"jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc\n" \
"oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq\n" \
"4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA\n" \
"mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d\n" \
"emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=\n" \
"-----END CERTIFICATE-----\n";

WiFiClientSecure espClient;
PubSubClient client(espClient);
#define MQTT_MAX_PACKET_SIZE 512  // Increase from default 256

// ====== WiFi Configuration ======
const char* ap_ssid = "AVONIC-System";
const char* ap_password = "avonic123";

// ====== Hardware Pins ======


RTC_DS3231 rtc;
bool rtcAvailable = false;

// ====== COMMAND PROTOCOL DEFINITIONS ======

#define CMD_BIN1_INTAKE_FAN 0xF1
#define CMD_BIN1_EXHAUST_FAN 0xF2
#define CMD_BIN1_PUMP 0xF3
#define CMD_BIN2_INTAKE_FAN 0xF4
#define CMD_BIN2_EXHAUST_FAN 0xF5
#define CMD_BIN2_PUMP 0xF6
#define CMD_PELTIER_MAIN 0xF7
#define CMD_PELTIER_PUMP 0xF8

// ====== Web Server ======
WebServer server(80);

// ====== Data Structures ======


// ✅ ADD THIS NEW STRUCT (after SensorData):


SensorData bin1Data;
SensorData bin2Data;
PeltierData peltierData;  // ← ADD THIS LINE
bool bin1DataReceived = false;
bool bin2DataReceived = false;
bool peltierDataReceived = false;  // ← ADD THIS LINE

// ====== Logging ======
unsigned long lastLogTime = 0;
const unsigned long LOG_INTERVAL = 10000;
bool sdMounted = false;

// ====== Sync Queue ======
struct PendingSyncData {
  String deviceID;
  String username;
  String email;
  String passwordHash;
  unsigned long timestamp;
};

bool pendingUserSync = false;
PendingSyncData pendingSyncData;
unsigned long lastSyncAttempt = 0;
const unsigned long SYNC_RETRY_INTERVAL = 5000; // Retry every 5 seconds

// ====== Forward Declarations ======
void handleRoot();
void handleData();
void handleCSS();
void handleNotFound();
void reconnectMQTT();
void publishSensorData();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void receiveDataFromSlave();
String generateDeviceID();
void handleAuthCSS();           
void handleDeviceID();          
void handleRegisterPage();   
void handleLoginPage();        
void handleDashboard();         
void handleRegister();          
void handleLogin();             
void handleLogout(); 
void handleResetRegistration(); 
void handleFactoryReset();      
void publishUserData(String deviceID, String username, String email, String passwordHash);
void handleForgotPasswordPage();
void handleResetPasswordPage();
void handleForgotPasswordAPI();
void handleResetPasswordAPI();
bool isUserRegistered();
void handleWiFiStatus();
void handleScanNetworks();
void handleConnectWiFi();
void handleDisconnectWiFi();
void checkWiFiConnection();

void handleBin1IntakeFanControl();
void handleBin1ExhaustFanControl();
void handleBin1PumpControl();
void handleBin2IntakeFanControl();
void handleBin2ExhaustFanControl();
void handleBin2PumpControl();
void handlePeltierMainControl();
void handlePeltierPumpControl();

unsigned long bin1LastUpdate = 0;
unsigned long bin2LastUpdate = 0;

// ====== SHA-256 Hashing Function ======
String sha256(String input) {
  byte hash[32];
  mbedtls_md_context_t ctx;
  mbedtls_md_type_t md_type = MBEDTLS_MD_SHA256;
  
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(md_type), 0);
  mbedtls_md_starts(&ctx);
  mbedtls_md_update(&ctx, (const unsigned char*)input.c_str(), input.length());
  mbedtls_md_finish(&ctx, hash);
  mbedtls_md_free(&ctx);
  
  // Convert to hex string
  String hashStr = "";
  for (int i = 0; i < 32; i++) {
    if (hash[i] < 16) hashStr += "0";
    hashStr += String(hash[i], HEX);
  }
  return hashStr;
}

// ====== Email Validation ======
bool isValidEmail(String email) {
  if (email.length() < 5) return false;
  if (email.indexOf('@') == -1) return false;
  if (email.indexOf('.') == -1) return false;
  if (email.indexOf('@') > email.lastIndexOf('.')) return false;
  return true;
}

// ====== Username Validation (alphanumeric only) ======
bool isValidUsername(String username) {
  if (username.length() < 3 || username.length() > 20) return false;
  for (unsigned int i = 0; i < username.length(); i++) {
    char c = username.charAt(i);
    if (!isalnum(c) && c != '_') return false;
  }
  return true;
}

// ====== Password Validation (min 6 chars) ======
bool isValidPassword(String password) {
  return password.length() >= 6;
}

// ====== Load Device State ======
DeviceState loadDeviceState() {
  // ✅ CHANGED: Start with WiFi setup if no user, not registration
  if (!isUserRegistered()) {
    Serial.println("📝 No user found, starting with WiFi setup");
    return STATE_WIFI_SETUP;  // Changed from STATE_REGISTRATION
  }
  
  File file = LittleFS.open(DEVICE_STATE_FILE, "r");
  if (!file) {
    Serial.println("📝 No state file, user exists, starting WiFi setup");
    return STATE_WIFI_SETUP;
  }
  
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, file);
  file.close();
  
  if (error) {
    return STATE_WIFI_SETUP;
  }
  
  String state = doc["state"] | "wifi_setup";
  if (state == "operational") return STATE_OPERATIONAL;
  if (state == "check_backend") return STATE_CHECK_BACKEND;
  if (state == "wifi_setup") return STATE_WIFI_SETUP;
  return STATE_WIFI_SETUP;  // Changed from STATE_REGISTRATION
}

// ====== Save Device State ======
void saveDeviceState(DeviceState state) {
  StaticJsonDocument<256> doc;
  
  if (state == STATE_WIFI_SETUP) doc["state"] = "wifi_setup";
  else if (state == STATE_CHECK_BACKEND) doc["state"] = "check_backend";
  else if (state == STATE_OPERATIONAL) doc["state"] = "operational";
  // Remove STATE_REGISTRATION case
  
  File file = LittleFS.open(DEVICE_STATE_FILE, "w");
  if (!file) {
    Serial.println("❌ Failed to save state");
    return;
  }
  
  serializeJson(doc, file);
  file.close();
  Serial.println("✅ Device state saved");
}

// ====== Save User Credentials to LittleFS ======
bool saveUserCredentials(String username, String email, String passwordHash) {
  StaticJsonDocument<512> doc;
  
  doc["device_id"] = deviceID;
  doc["username"] = username;
  doc["email"] = email;
  doc["password_hash"] = passwordHash;
  doc["created_at"] = millis();
  doc["synced_to_db"] = false;  // Not yet synced
  
  File file = LittleFS.open(USER_CREDS_FILE, "w");
  if (!file) {
    Serial.println("❌ Failed to save credentials");
    return false;
  }
  
  serializeJson(doc, file);
  file.close();
  
  Serial.println("✅ User credentials saved to LittleFS");
  return true;
}

// ====== Check if User Already Registered ======
bool isUserRegistered() {
  static bool cached = false;
  static bool lastResult = false;
  static unsigned long lastCheck = 0;
  
  // Check only once per second to avoid spamming file system
  if (!cached || millis() - lastCheck > 1000) {
    File file = LittleFS.open(USER_CREDS_FILE, "r");
    lastResult = file ? true : false;
    if (file) file.close();
    lastCheck = millis();
    cached = true;
  }
  
  return lastResult;
}

// ====== Sync User to Backend (Non-Blocking with Queue) ======
bool syncUserToBackend() {
  if (!LittleFS.exists(USER_CREDS_FILE)) {
    Serial.println("⚠️ No user credentials to sync");
    return false;
  }
  
  File file = LittleFS.open(USER_CREDS_FILE, "r");
  if (!file) return false;
  
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, file);
  file.close();
  
  if (error) {
    Serial.println("❌ Failed to parse credentials");
    return false;
  }
  
  // Check if already synced
  if (doc["synced_to_db"] | false) {
    Serial.println("ℹ️ User already synced to database");
    return true;
  }
  
  // ✅ QUEUE THE SYNC - Don't wait for MQTT
  pendingSyncData.deviceID = doc["device_id"] | "";
  pendingSyncData.username = doc["username"] | "";
  pendingSyncData.email = doc["email"] | "";
  pendingSyncData.passwordHash = doc["password_hash"] | "";
  pendingSyncData.timestamp = millis();
  
  pendingUserSync = true;
  
  Serial.println("📋 User sync queued for background processing");
  Serial.println("   Username: " + pendingSyncData.username);
  
  return true;
}

// ====== Process Pending Sync Queue (Call in loop()) ======
// ====== Process Pending Sync Queue (Call in loop()) ======
void processPendingSync() {
  // Only process if there's pending sync and MQTT is connected
  if (!pendingUserSync) return;
  
  // Rate limiting - don't spam MQTT
  if (millis() - lastSyncAttempt < SYNC_RETRY_INTERVAL) return;
  lastSyncAttempt = millis();
  
  // Check MQTT connection
  if (!client.connected()) {
    Serial.println("⏳ Waiting for MQTT connection to sync user...");
    return;
  }
  
  // MQTT is connected - publish now!
  Serial.println("📤 MQTT connected! Publishing queued user data...");
  Serial.println("   Device ID: " + pendingSyncData.deviceID);
  Serial.println("   Username: " + pendingSyncData.username);
  Serial.println("   Email: " + pendingSyncData.email);
  
  publishUserData(
    pendingSyncData.deviceID,
    pendingSyncData.username,
    pendingSyncData.email,
    pendingSyncData.passwordHash
  );
  
  // Mark as synced in local file
  File file = LittleFS.open(USER_CREDS_FILE, "r");
  if (file) {
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, file);
    file.close();
    
    if (!error) {
      doc["synced_to_db"] = true;
      
      file = LittleFS.open(USER_CREDS_FILE, "w");
      if (file) {
        serializeJson(doc, file);
        file.close();
        Serial.println("✅ User marked as synced in local storage");
      }
    }
  }
  
  // Clear the queue
  pendingUserSync = false;
  Serial.println("✅ Background sync completed!");
}

// ====== Download Users from Backend ======
bool downloadUsersFromBackend() {
  Serial.println("📥 Checking backend for registered users...");
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected");
    return false;
  }
  
  HTTPClient http;
  String url = String("https://") + BACKEND_API + "/api/users/device/" + deviceID;
  
  Serial.println("🌐 Requesting: " + url);
  http.begin(url);
  http.setTimeout(10000); // 10 second timeout
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println("📦 Response: " + payload);
    
    StaticJsonDocument<1024> doc;
    DeserializationError error = deserializeJson(doc, payload);
    
    if (error) {
      Serial.println("❌ Failed to parse JSON");
      http.end();
      return false;
    }
    
    JsonArray users = doc["users"];
    int userCount = users.size();
    
    Serial.printf("👥 Found %d user(s) registered online\n", userCount);
    
    if (userCount > 0) {
      // Store the FIRST user locally (or implement multi-user storage)
      JsonObject firstUser = users[0];
      String username = firstUser["username"] | "";
      String passwordHash = firstUser["password_hash"] | "";
      
      if (username.length() > 0 && passwordHash.length() > 0) {
        // Save to LittleFS
        StaticJsonDocument<512> credDoc;
        credDoc["device_id"] = deviceID;
        credDoc["username"] = username;
        credDoc["email"] = ""; // Email not needed for login
        credDoc["password_hash"] = passwordHash;
        credDoc["created_at"] = millis();
        credDoc["synced_to_db"] = true; // Already from backend
        
        File file = LittleFS.open(USER_CREDS_FILE, "w");
        if (file) {
          serializeJson(credDoc, file);
          file.close();
          Serial.println("✅ User credentials downloaded: " + username);
          http.end();
          return true;
        }
      }
    } else {
      Serial.println("ℹ️ No users registered online for this device");
    }
  } else {
    Serial.printf("❌ HTTP GET failed, code: %d\n", httpCode);
  }
  
  http.end();
  return false;
}


// ====== Handle Registration Form Submission ======
void handleRegister() {

    if (isUserRegistered()) {
    server.send(400, "application/json", 
      "{\"error\":\"User already registered on this device. Please login or reset registration.\"}");
    return;
  }
  
  String username = server.arg("username");
  String email = server.arg("email");
  String password = server.arg("password");
  
  // Validate inputs
  if (!isValidUsername(username)) {
    server.send(400, "application/json", 
      "{\"error\":\"Username must be 3-20 alphanumeric characters\"}");
    return;
  }
  
  if (!isValidEmail(email)) {
    server.send(400, "application/json", 
      "{\"error\":\"Invalid email format\"}");
    return;
  }
  
  if (!isValidPassword(password)) {
    server.send(400, "application/json", 
      "{\"error\":\"Password must be at least 6 characters\"}");
    return;
  }
  
  // Hash password
  String passwordHash = sha256(password);
  Serial.println("🔐 Password hashed: " + passwordHash.substring(0, 16) + "...");
  
  // Save to LittleFS
  if (saveUserCredentials(username, email, passwordHash)) {
    
    // ✅ CHANGED: Stay in operational mode, just queue sync
    currentState = STATE_OPERATIONAL;
    saveDeviceState(STATE_OPERATIONAL);
    
    // Queue sync
    syncUserToBackend();
    
    server.send(200, "application/json", 
      "{\"success\":true,\"message\":\"Registration successful! Redirecting to login...\"}");
    
    Serial.println("✅ Registration complete: " + username);
  } else {
    server.send(500, "application/json", 
      "{\"error\":\"Failed to save registration\"}");
  }
}

// ====== Verify Login Credentials (Offline) ======
bool verifyLoginOffline(String username, String password) {
  if (!LittleFS.exists(USER_CREDS_FILE)) {
    Serial.println("❌ No user credentials found");
    return false;
  }
  
  File file = LittleFS.open(USER_CREDS_FILE, "r");
  if (!file) return false;
  
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, file);
  file.close();
  
  if (error) return false;
  
  String storedUsername = doc["username"] | "";
  String storedHash = doc["password_hash"] | "";
  
  // Hash the provided password and compare
  String providedHash = sha256(password);
  
  if (storedUsername == username && storedHash == providedHash) {
    Serial.println("✅ Login successful (offline verification)");
    return true;
  }
  
  Serial.println("❌ Invalid credentials");
  return false;
}

// ====== Handle Login Form Submission ======
void handleLogin() {
  String username = server.arg("username");
  String password = server.arg("password");
  
  if (username.length() == 0 || password.length() == 0) {
    server.send(400, "application/json", 
      "{\"error\":\"Username and password required\"}");
    return;
  }
  
  // Verify credentials offline
  if (verifyLoginOffline(username, password)) {
    isUserLoggedIn = true;
    loggedInUsername = username;
    
    // ✅ Queue user sync (will happen automatically in background)
    syncUserToBackend();
    
    server.send(200, "application/json", 
      "{\"success\":true,\"message\":\"Login successful\",\"username\":\"" + username + "\"}");
    
    Serial.println("👤 User logged in: " + username);
  } else {
    server.send(401, "application/json", 
      "{\"error\":\"Invalid username or password\"}");
  }
}

// ====== Handle Logout ======
void handleLogout() {
  isUserLoggedIn = false;
  loggedInUsername = "";
  server.send(200, "application/json", 
    "{\"success\":true,\"message\":\"Logged out\"}");
  Serial.println("👋 User logged out");
}

// ====== Handle Reset Registration (Admin/Logged-in User Only) ======
void handleResetRegistration() {
  String password = server.arg("password");
  
  if (password.length() == 0) {
    server.send(400, "application/json", 
      "{\"error\":\"Password required for reset\"}");
    return;
  }
  
  // Verify current password before allowing reset
  if (!verifyLoginOffline(loggedInUsername, password)) {
    server.send(401, "application/json", 
      "{\"error\":\"Invalid password\"}");
    return;
  }
  
  Serial.println("🔄 Registration reset requested by: " + loggedInUsername);
  
  // Delete ONLY user credentials (keep state file, keep WiFi)
  if (LittleFS.exists(USER_CREDS_FILE)) {
    LittleFS.remove(USER_CREDS_FILE);
    Serial.println("✅ User credentials deleted");
  }
  
  // ✅ FIXED: Go back to WIFI_SETUP state to allow re-registration
  // (WiFi credentials are still saved, so it will auto-connect)
  currentState = STATE_WIFI_SETUP;
  saveDeviceState(STATE_WIFI_SETUP);
  
  // Log out user
  isUserLoggedIn = false;
  loggedInUsername = "";
  
  server.send(200, "application/json", 
    "{\"success\":true,\"message\":\"Registration reset. Restarting to allow re-registration...\"}");
  
  Serial.println("🔄 User can now re-register");
  
  // ✅ RESTART to trigger state machine properly
  delay(2000);
  ESP.restart();
}

// ====== Check if User is Logged In (Middleware) ======
bool requireLogin() {
  if (!isUserLoggedIn) {
    server.send(401, "application/json", 
      "{\"error\":\"Not logged in\"}");
    return false;
  }
  return true;
}

// ====== Handle Factory Reset (Clears Everything) ======
void handleFactoryReset() {
  String password = server.arg("password");
  String confirmText = server.arg("confirm");
  
  // Require confirmation text "FACTORY RESET"
  if (confirmText != "FACTORY RESET") {
    server.send(400, "application/json", 
      "{\"error\":\"Must type 'FACTORY RESET' to confirm\"}");
    return;
  }
  
  // Verify password if user is logged in
  if (isUserLoggedIn && !verifyLoginOffline(loggedInUsername, password)) {
    server.send(401, "application/json", 
      "{\"error\":\"Invalid password\"}");
    return;
  }
  
  Serial.println("🔥 FACTORY RESET initiated!");
  
  // Delete ALL files (user credentials + device state)
  if (LittleFS.exists(USER_CREDS_FILE)) {
    LittleFS.remove(USER_CREDS_FILE);
    Serial.println("✅ User credentials deleted");
  }
  if (LittleFS.exists(DEVICE_STATE_FILE)) {
    LittleFS.remove(DEVICE_STATE_FILE);
    Serial.println("✅ Device state deleted");
  }
  
  // ✅ FIXED: Clear WiFi credentials using WiFiManager
  WiFiManager wm;
  wm.resetSettings();
  WiFi.disconnect(true, true);
  Serial.println("✅ WiFi credentials cleared");
  
  // Reset state to WiFi setup
  currentState = STATE_WIFI_SETUP;
  saveDeviceState(STATE_WIFI_SETUP);
  
  server.send(200, "application/json", 
    "{\"success\":true,\"message\":\"Factory reset complete. Restarting...\"}");
  
  delay(2000);
  ESP.restart();
}


// ====== FIXED WEB SERVER CONTROL HANDLERS ======
// Add these AFTER your existing handlers (around line 800)

// ✅ HELPER: Publish command to MQTT for backend sync
void publishCommandToMQTT(int bin, String device, bool state) {
  if (!client.connected()) {
    Serial.println("⚠️ MQTT not connected - command only sent locally");
    return;
  }
  
  StaticJsonDocument<256> doc;
  doc["espID"] = deviceID;
  doc["bin"] = bin;
  doc["device"] = device;
  doc["state"] = state ? 1 : 0;
  doc["timestamp"] = millis();
  doc["source"] = "esp_web";
  
  String payload;
  serializeJson(doc, payload);
  
  String topic = "commands/" + deviceID + "/actuator-control";
  client.publish(topic.c_str(), payload.c_str(), false);
  
  Serial.println("📤 Published to MQTT: " + device + " → " + String(state ? "ON" : "OFF"));
}

// ====== BIN 1 INTAKE FAN ======
void handleBin1IntakeFanControl() {
  if (!requireLogin()) return;
  
  if (!server.hasArg("state")) {
    server.send(400, "application/json", "{\"error\":\"Missing state parameter\"}");
    return;
  }
  
  String state = server.arg("state");
  bool fanState = (state == "on" || state == "1" || state == "true");
  
  // 1. Send to Slave via Serial2
  byte command[3];
  command[0] = CMD_BIN1_INTAKE_FAN;
  command[1] = fanState ? 0x01 : 0x00;
  command[2] = 0xFF;
  SERIAL_COMM.write(command, 3);
  
  // 2. Publish to MQTT for backend sync
  publishCommandToMQTT(1, "intake-fan", fanState);
  
  String json = "{\"success\":true,\"bin\":1,\"device\":\"intake-fan\",\"state\":";
  json += fanState ? "true" : "false";
  json += "}";
  
  server.send(200, "application/json", json);
  Serial.println("✅ Bin 1 Intake Fan: " + String(fanState ? "ON" : "OFF"));
}

// ====== BIN 1 EXHAUST FAN ======
void handleBin1ExhaustFanControl() {
  if (!requireLogin()) return;
  
  if (!server.hasArg("state")) {
    server.send(400, "application/json", "{\"error\":\"Missing state parameter\"}");
    return;
  }
  
  String state = server.arg("state");
  bool fanState = (state == "on" || state == "1" || state == "true");
  
  byte command[3];
  command[0] = CMD_BIN1_EXHAUST_FAN;
  command[1] = fanState ? 0x01 : 0x00;
  command[2] = 0xFF;
  SERIAL_COMM.write(command, 3);
  
  publishCommandToMQTT(1, "exhaust-fan", fanState);
  
  String json = "{\"success\":true,\"bin\":1,\"device\":\"exhaust-fan\",\"state\":";
  json += fanState ? "true" : "false";
  json += "}";
  
  server.send(200, "application/json", json);
  Serial.println("✅ Bin 1 Exhaust Fan: " + String(fanState ? "ON" : "OFF"));
}

// ====== BIN 1 PUMP ======
void handleBin1PumpControl() {
  if (!requireLogin()) return;
  
  if (!server.hasArg("state")) {
    server.send(400, "application/json", "{\"error\":\"Missing state parameter\"}");
    return;
  }
  
  String state = server.arg("state");
  bool pumpState = (state == "on" || state == "1" || state == "true");
  
  byte command[3];
  command[0] = CMD_BIN1_PUMP;
  command[1] = pumpState ? 0x01 : 0x00;
  command[2] = 0xFF;
  SERIAL_COMM.write(command, 3);
  
  publishCommandToMQTT(1, "pump", pumpState);
  
  String json = "{\"success\":true,\"bin\":1,\"device\":\"pump\",\"state\":";
  json += pumpState ? "true" : "false";
  json += "}";
  
  server.send(200, "application/json", json);
  Serial.println("✅ Bin 1 Pump: " + String(pumpState ? "ON" : "OFF"));
}

// ====== BIN 2 INTAKE FAN ======
void handleBin2IntakeFanControl() {
  if (!requireLogin()) return;
  
  if (!server.hasArg("state")) {
    server.send(400, "application/json", "{\"error\":\"Missing state parameter\"}");
    return;
  }
  
  String state = server.arg("state");
  bool fanState = (state == "on" || state == "1" || state == "true");
  
  byte command[3];
  command[0] = CMD_BIN2_INTAKE_FAN;
  command[1] = fanState ? 0x01 : 0x00;
  command[2] = 0xFF;
  SERIAL_COMM.write(command, 3);
  
  publishCommandToMQTT(2, "intake-fan", fanState);
  
  String json = "{\"success\":true,\"bin\":2,\"device\":\"intake-fan\",\"state\":";
  json += fanState ? "true" : "false";
  json += "}";
  
  server.send(200, "application/json", json);
  Serial.println("✅ Bin 2 Intake Fan: " + String(fanState ? "ON" : "OFF"));
}

// ====== BIN 2 EXHAUST FAN ======
void handleBin2ExhaustFanControl() {
  if (!requireLogin()) return;
  
  if (!server.hasArg("state")) {
    server.send(400, "application/json", "{\"error\":\"Missing state parameter\"}");
    return;
  }
  
  String state = server.arg("state");
  bool fanState = (state == "on" || state == "1" || state == "true");
  
  byte command[3];
  command[0] = CMD_BIN2_EXHAUST_FAN;
  command[1] = fanState ? 0x01 : 0x00;
  command[2] = 0xFF;
  SERIAL_COMM.write(command, 3);
  
  publishCommandToMQTT(2, "exhaust-fan", fanState);
  
  String json = "{\"success\":true,\"bin\":2,\"device\":\"exhaust-fan\",\"state\":";
  json += fanState ? "true" : "false";
  json += "}";
  
  server.send(200, "application/json", json);
  Serial.println("✅ Bin 2 Exhaust Fan: " + String(fanState ? "ON" : "OFF"));
}

// ====== BIN 2 PUMP ======
void handleBin2PumpControl() {
  if (!requireLogin()) return;
  
  if (!server.hasArg("state")) {
    server.send(400, "application/json", "{\"error\":\"Missing state parameter\"}");
    return;
  }
  
  String state = server.arg("state");
  bool pumpState = (state == "on" || state == "1" || state == "true");
  
  byte command[3];
  command[0] = CMD_BIN2_PUMP;
  command[1] = pumpState ? 0x01 : 0x00;
  command[2] = 0xFF;
  SERIAL_COMM.write(command, 3);
  
  publishCommandToMQTT(2, "pump", pumpState);
  
  String json = "{\"success\":true,\"bin\":2,\"device\":\"pump\",\"state\":";
  json += pumpState ? "true" : "false";
  json += "}";
  
  server.send(200, "application/json", json);
  Serial.println("✅ Bin 2 Pump: " + String(pumpState ? "ON" : "OFF"));
}

// ====== PELTIER MAIN ======
void handlePeltierMainControl() {
  if (!requireLogin()) return;
  
  if (!server.hasArg("state")) {
    server.send(400, "application/json", "{\"error\":\"Missing state parameter\"}");
    return;
  }
  
  String state = server.arg("state");
  bool peltierState = (state == "on" || state == "1" || state == "true");
  
  byte command[3];
  command[0] = CMD_PELTIER_MAIN;
  command[1] = peltierState ? 0x01 : 0x00;
  command[2] = 0xFF;
  SERIAL_COMM.write(command, 3);
  
  publishCommandToMQTT(0, "peltier-main", peltierState);
  
  String json = "{\"success\":true,\"device\":\"peltier-main\",\"state\":";
  json += peltierState ? "true" : "false";
  json += "}";
  
  server.send(200, "application/json", json);
  Serial.println("✅ Peltier Main: " + String(peltierState ? "ON" : "OFF"));
}

// ====== PELTIER PUMP ======
void handlePeltierPumpControl() {
  if (!requireLogin()) return;
  
  if (!server.hasArg("state")) {
    server.send(400, "application/json", "{\"error\":\"Missing state parameter\"}");
    return;
  }
  
  String state = server.arg("state");
  bool pumpState = (state == "on" || state == "1" || state == "true");
  
  byte command[3];
  command[0] = CMD_PELTIER_PUMP;
  command[1] = pumpState ? 0x01 : 0x00;
  command[2] = 0xFF;
  SERIAL_COMM.write(command, 3);
  
  publishCommandToMQTT(0, "peltier-pump", pumpState);
  
  String json = "{\"success\":true,\"device\":\"peltier-pump\",\"state\":";
  json += pumpState ? "true" : "false";
  json += "}";
  
  server.send(200, "application/json", json);
  Serial.println("✅ Peltier Pump: " + String(pumpState ? "ON" : "OFF"));
}

// ====== REPLACE YOUR ENTIRE setup() FUNCTION WITH THIS ======

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== AVONIC Master N16R8 Boot ===");
  
  deviceID = generateDeviceID();
  Serial.println("📱 Device ID: " + deviceID);
  
  // Initialize LittleFS FIRST
  if (!LittleFS.begin(true)) {
    Serial.println("❌ LittleFS Mount Failed!");
    return;
  }
  Serial.println("✅ LittleFS Mounted");

  // ✅ ADD THIS LINE
  SDStore::begin();
  
  // Load device state
  currentState = loadDeviceState();
  Serial.printf("📊 Device State: %d ", currentState);
  if (currentState == STATE_WIFI_SETUP) Serial.println("(WIFI_SETUP)");
  else if (currentState == STATE_CHECK_BACKEND) Serial.println("(CHECK_BACKEND)");
  else if (currentState == STATE_OPERATIONAL) Serial.println("(OPERATIONAL)");
  
  // Initialize Serial2
  SERIAL_COMM.begin(115200, SERIAL_8N1, RX2_PIN, TX2_PIN);
  Serial.println("✅ Serial2 initialized");
  
  // Initialize RTC
  Serial.println("🕐 Initializing RTC...");
  Wire.begin(2, 1);
  if (!rtc.begin()) {
    Serial.println("⚠️ RTC not found!");
    rtcAvailable = false;
  } else {
    Serial.println("✅ RTC initialized");
    rtcAvailable = true;
    if (rtc.lostPower()) {
      rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
  }
  

// ====== STATE MACHINE WITH WiFiManager FALLBACK ======
  
  // Step 1: WiFi Setup
  if (currentState == STATE_WIFI_SETUP) {
    Serial.println("\n📡 === WIFI SETUP MODE ===");
    
    // ✅ Start Local AP first (always available)
    WiFi.mode(WIFI_AP_STA);
    if (!WiFi.softAP(ap_ssid, ap_password)) {
      Serial.println("⚠️ Failed to start AP, retrying...");
      WiFi.softAP(ap_ssid, ap_password);
    }
    Serial.println("✅ Local AP started: " + WiFi.softAPIP().toString());
    
    // ✅ Try auto-connect with TIMEOUT (3 attempts = ~15 seconds)
    Serial.println("📡 Attempting auto-connect to saved WiFi...");
    WiFi.begin(); // Use saved credentials
    
    int maxAttempts = 3;
    int attemptDelay = 5000; // 5 seconds per attempt
    bool connected = false;
    
    for (int attempt = 1; attempt <= maxAttempts; attempt++) {
      Serial.printf("   Attempt %d/%d...\n", attempt, maxAttempts);
      
      unsigned long startAttempt = millis();
      while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < attemptDelay) {
        delay(100);
        Serial.print(".");
      }
      Serial.println();
      
      if (WiFi.status() == WL_CONNECTED) {
        connected = true;
        Serial.println("✅ WiFi connected: " + WiFi.SSID());
        Serial.println("📍 IP Address: " + WiFi.localIP().toString());
        break;
      } else {
        Serial.printf("❌ Attempt %d failed\n", attempt);
      }
    }
    
    // ✅ IF AUTO-CONNECT FAILED → START WiFiManager CAPTIVE PORTAL
    if (!connected) {
      Serial.println("\n⚠️ Auto-connect failed after 3 attempts");
      Serial.println("🌐 Starting WiFiManager Configuration Portal...");
      Serial.println("   📱 Connect to WiFi: AVONIC-Setup");
      Serial.println("   🔗 Portal will open automatically (captive portal)");
      
      WiFiManager wm;
      
      // ✅ Configure WiFiManager
      wm.setConfigPortalTimeout(180); // 3 minute timeout
      wm.setAPStaticIPConfig(IPAddress(192,168,4,1), IPAddress(192,168,4,1), IPAddress(255,255,255,0));
      wm.setTitle("AVONIC System Setup");
      wm.setDarkMode(true);
      
      // ✅ Custom parameters (optional - show device ID)
      WiFiManagerParameter custom_device_id("device_id", "Device ID (read-only)", deviceID.c_str(), 40, "readonly");
      wm.addParameter(&custom_device_id);
      
      // ✅ START BLOCKING PORTAL (User MUST configure WiFi)
      bool wmResult = wm.startConfigPortal("AVONIC-Setup"); // Open network for easy access
      
      if (wmResult) {
        Serial.println("✅ WiFi configured via portal!");
        Serial.println("📍 Connected to: " + WiFi.SSID());
        Serial.println("📍 IP Address: " + WiFi.localIP().toString());
        connected = true;
      } else {
        Serial.println("❌ WiFiManager portal timeout or failed");
        Serial.println("⚠️ Continuing in AP-only mode (offline)");
        connected = false;
      }
      
      // ✅ Restart Local AP after portal closes
      WiFi.mode(WIFI_AP_STA);
      WiFi.softAP(ap_ssid, ap_password);
      Serial.println("✅ Local AP restarted: " + WiFi.softAPIP().toString());
    }
    
    // ✅ PROCEED TO NEXT STATE
    if (connected) {
      currentState = STATE_CHECK_BACKEND;
      saveDeviceState(STATE_CHECK_BACKEND);
      Serial.println("📡 Proceeding to check backend...");
    } else {
      Serial.println("📡 No WiFi - running in AP-only mode");
      currentState = STATE_OPERATIONAL;
      saveDeviceState(STATE_OPERATIONAL);
    }
  }

  // Step 2: Check Backend (if WiFi connected)
  if (currentState == STATE_CHECK_BACKEND) {
    Serial.println("\n🔍 === CHECKING BACKEND ===");
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("📥 Downloading user data from backend...");
      downloadUsersFromBackend();
    } else {
      Serial.println("⚠️ WiFi not connected - skipping backend check");
    }
    
    currentState = STATE_OPERATIONAL;
    saveDeviceState(STATE_OPERATIONAL);
    Serial.println("📡 Proceeding to operational mode...");
  }

// ====== FIND THIS SECTION IN YOUR CODE (around line 971) ======
// Step 3: Operational Mode (always runs)
if (currentState == STATE_OPERATIONAL) {
  Serial.println("\n✅ === OPERATIONAL MODE ===");
  
  // ✅ Ensure AP is running
  WiFi.mode(WIFI_AP_STA);
  if (!WiFi.softAP(ap_ssid, ap_password)) {
    Serial.println("⚠️ Failed to start AP, retrying...");
    WiFi.softAP(ap_ssid, ap_password);
  }
  Serial.println("✅ Local AP: " + WiFi.softAPIP().toString());
  
  // ✅ Try WiFi connection if not connected (3 attempts)
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("📡 Attempting to connect to saved WiFi...");
    WiFi.begin();
    
    int maxAttempts = 3;
    bool connected = false;
    
    for (int i = 0; i < maxAttempts; i++) {
      unsigned long startAttempt = millis();
      while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 5000) {
        delay(100);
      }
      
      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n✅ WiFi connected: " + WiFi.SSID());
        connected = true;
        
        // Check backend for users
        Serial.println("📥 Checking for online users...");
        downloadUsersFromBackend();
        
        // Queue sync if user exists
        if (isUserRegistered()) {
          syncUserToBackend();
        }
        break;
      } else {
        Serial.printf("❌ Attempt %d/%d failed\n", i+1, maxAttempts);
      }
    }
    
    // ✅ NEW: If all attempts failed, offer WiFiManager portal
    if (!connected) {
      Serial.println("\n⚠️ WiFi connection failed after 3 attempts");
      Serial.println("🌐 Starting WiFiManager Configuration Portal...");
      Serial.println("   📱 Connect to WiFi: AVONIC-Setup");
      Serial.println("   🔗 Configure WiFi or skip to continue offline");
      
      WiFiManager wm;
      
      // Configure portal
      wm.setConfigPortalTimeout(180); // 3 minutes
      wm.setAPStaticIPConfig(IPAddress(192,168,4,1), IPAddress(192,168,4,1), IPAddress(255,255,255,0));
      wm.setTitle("AVONIC WiFi Setup");
      wm.setDarkMode(true);
      
      // Show device ID
      WiFiManagerParameter custom_device_id("device_id", "Device ID (read-only)", deviceID.c_str(), 40, "readonly");
      wm.addParameter(&custom_device_id);
      
      // Start portal
      bool wmResult = wm.startConfigPortal("AVONIC-Setup");
      
      if (wmResult) {
        Serial.println("✅ WiFi configured via portal!");
        Serial.println("📍 Connected to: " + WiFi.SSID());
        Serial.println("📍 IP Address: " + WiFi.localIP().toString());
        
        // Check backend for users
        Serial.println("📥 Checking for online users...");
        downloadUsersFromBackend();
        
        // Queue sync if user exists
        if (isUserRegistered()) {
          syncUserToBackend();
        }
      } else {
        Serial.println("❌ WiFiManager portal timeout or skipped");
        Serial.println("⚠️ Continuing in offline mode");
        Serial.println("💡 WiFi can be configured later via Settings → WiFi");
      }
      
      // ✅ Restart Local AP after portal closes
      WiFi.mode(WIFI_AP_STA);
      WiFi.softAP(ap_ssid, ap_password);
      Serial.println("✅ Local AP restarted: " + WiFi.softAPIP().toString());
    }
  }
  
  // ... REST OF OPERATIONAL MODE CODE (MQTT, Web Server, etc.)
  // Continue with your existing code below...
    
    // MQTT setup
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(mqttCallback);
    client.setBufferSize(512);
    espClient.setCACert(root_ca);
    
    // ====== WEB SERVER ROUTES ======
    server.serveStatic("/img", LittleFS, "/img");
    server.serveStatic("/js", LittleFS, "/js");
    server.serveStatic("/fonts", LittleFS, "/fonts");
    server.serveStatic("/img2", LittleFS, "/img2");

    
// ✅ NEW: Subscribe to device-specific command topics
if (WiFi.status() == WL_CONNECTED) {
  // Try to connect to MQTT
  String clientId = "AVONIC-Master-" + String(random(0xffff), HEX);
  if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
    Serial.println("✅ MQTT connected in setup");
    
    // Subscribe to device-specific topics
    String claimedTopic = "commands/" + deviceID + "/claimed";
    String syncTopic = "commands/" + deviceID + "/sync-credentials";
    String passwordTopic = "commands/" + deviceID + "/password-updated";
    String confirmTopic = "commands/" + deviceID + "/sync-confirmed";
    String unclaimTopic = "commands/" + deviceID + "/unclaim-confirmed";
    String actuatorTopic = "commands/" + deviceID + "/actuator-control";
    
    
    
    client.subscribe(claimedTopic.c_str(), 1);
    client.subscribe(syncTopic.c_str(), 1);
    client.subscribe(passwordTopic.c_str(), 1);
    client.subscribe(confirmTopic.c_str(), 1);
    client.subscribe(unclaimTopic.c_str(), 1);
    client.subscribe(actuatorTopic.c_str(), 1);
    
    Serial.println("✅ Subscribed to: " + confirmTopic);
    Serial.println("✅ Subscribed to: " + claimedTopic);
    Serial.println("✅ Subscribed to: " + syncTopic);
    Serial.println("✅ Subscribed to: " + passwordTopic);
    Serial.println("✅ Subscribed to: " + unclaimTopic);
    Serial.println("✅ Subscribed to: " + actuatorTopic);
    
    // ✅✅✅ ADD THIS NEW CODE ✅✅✅
    // Request credentials from backend if device is not registered locally
    if (!isUserRegistered()) {
      Serial.println("📤 Requesting credentials from backend...");
      
      String requestTopic = "commands/" + deviceID + "/request-credentials";
      StaticJsonDocument<128> requestDoc;
      requestDoc["espID"] = deviceID;
      
      String requestPayload;
      serializeJson(requestDoc, requestPayload);
      
      bool published = client.publish(requestTopic.c_str(), requestPayload.c_str(), false);
      
      if (published) {
        Serial.println("   ✅ Request sent successfully");
        Serial.println("   Topic: " + requestTopic);
        Serial.println("   Payload: " + requestPayload);
        
        // Wait briefly for response
        Serial.println("   ⏳ Waiting for credentials...");
        unsigned long waitStart = millis();
        while (millis() - waitStart < 5000) {  // Wait 5 seconds
          client.loop();
          delay(100);
          
          // Check if credentials were received
          if (isUserRegistered()) {
            Serial.println("   ✅ Credentials received and saved!");
            break;
          }
        }
        
        if (!isUserRegistered()) {
          Serial.println("   ℹ️ No credentials received - device unclaimed");
        }
      } else {
        Serial.println("   ❌ Failed to publish request");
      }
    } else {
      Serial.println("ℹ️ User already registered locally - skipping credential request");
    }
    // ✅✅✅ END OF NEW CODE ✅✅✅
    
  } else {
    Serial.println("⚠️ MQTT connection failed in setup");
  }
}

// ====== BOOT BUTTON CHECK (5s Hold = Unclaim Device) ======
pinMode(BOOT_PIN, INPUT_PULLUP);
delay(200);
unsigned long pressStart = millis();
bool unclaimTriggered = false;

Serial.println("🔘 Hold BOOT button for 5 seconds to unclaim device");

while (digitalRead(BOOT_PIN) == LOW) {
  unsigned long pressDuration = millis() - pressStart;
  
  // 5 seconds = Unclaim device
  if (pressDuration > 5000) {
    Serial.println("🔓 5s reached - Unclaiming device!");
    unclaimTriggered = true;
    break;
  }
}

// Handle unclaim (5 seconds hold)
if (unclaimTriggered) {
  Serial.println("🔓 UNCLAIMING DEVICE...");
  
  if (isUserRegistered()) {
    // Send unclaim request via MQTT (if connected)
    if (WiFi.status() == WL_CONNECTED && client.connected()) {
      String payload = "{\"espID\":\"" + deviceID + "\"}";
      client.publish("avonic/unclaim-device", payload.c_str(), true); // QoS 1
      Serial.println("📤 Unclaim request sent to backend");
      delay(2000); // Wait for backend to process
    } else {
      Serial.println("⚠️ Offline - will unclaim locally only");
    }
    
    // Delete local user credentials
    if (LittleFS.exists(USER_CREDS_FILE)) {
      LittleFS.remove(USER_CREDS_FILE);
      Serial.println("✅ Local credentials deleted");
    }

    // ✅ ADD THIS LINE to reset cache
extern bool isUserRegistered();  // Force cache reset on next call
    
    // Reset state to WiFi setup (ready for new claim)
    currentState = STATE_WIFI_SETUP;
    saveDeviceState(STATE_WIFI_SETUP);
    
    Serial.println("🎉 Device unclaimed successfully!");
    Serial.println("   Device can now be claimed by another user");
    Serial.println("   Restarting...");
  } else {
    Serial.println("⚠️ Device was not claimed - nothing to unclaim");
  }
  
  delay(2000);
  ESP.restart();
}
  

// // ✅ NEW: Request credentials from backend if not registered locally
// if (!isUserRegistered() && WiFi.status() == WL_CONNECTED && client.connected()) {
//   Serial.println("⏳ Waiting 10 seconds before checking claim status...");
//   delay(10000);  // Give backend time to process any pending unclaims
  
//   String requestTopic = "commands/" + deviceID + "/request-credentials";
//   String payload = "{\"espID\":\"" + deviceID + "\"}";
  
//   client.publish(requestTopic.c_str(), payload.c_str());
//   Serial.println("📤 Requesting credentials from backend...");
  
//   // Wait briefly for response
//   unsigned long waitStart = millis();
//   while (millis() - waitStart < 5000) {  // Wait 5 seconds
//     client.loop();
//     delay(100);
//   }
  
//   // Check if credentials were received
//   if (isUserRegistered()) {
//     Serial.println("✅ Credentials received and saved!");
//   } else {
//     Serial.println("ℹ️ No credentials yet - device unclaimed");
//   }
// }

  // ====== AUTH ROUTES (Updated for forms.html) ======

// Root route - Serve index.html
server.on("/", HTTP_GET, []() {
  File file = LittleFS.open("/index.html", "r");
  if (!file) {
    server.send(404, "text/plain", "index.html not found");
    return;
  }
  server.streamFile(file, "text/html");
  file.close();
});

// Serve forms.css
server.on("/forms.css", HTTP_GET, []() {
  File file = LittleFS.open("/forms.css", "r");
  if (!file) {
    server.send(404, "text/plain", "forms.css not found");
    return;
  }
  server.streamFile(file, "text/css");
  file.close();
});

// ✅ KEEP THESE - API endpoints are unchanged
server.on("/login", HTTP_POST, handleLogin);
server.on("/register", HTTP_POST, handleRegister);
server.on("/logout", HTTP_GET, handleLogout);
server.on("/dashboard", HTTP_GET, handleDashboard);
server.on("/api/forgot-password", HTTP_POST, handleForgotPasswordAPI);
server.on("/api/reset-password", HTTP_POST, handleResetPasswordAPI);

// ✅ REMOVE THESE - No longer needed (forms are in forms.html)
// server.on("/login", HTTP_GET, handleLoginPage);
// server.on("/register", HTTP_GET, handleRegisterPage);
// server.on("/forgot-password", HTTP_GET, handleForgotPasswordPage);
// server.on("/reset-password", HTTP_GET, handleResetPasswordPage);
    


      server.on("/api/bin1/intake-fan", HTTP_POST, handleBin1IntakeFanControl);
    server.on("/api/bin1/exhaust-fan", HTTP_POST, handleBin1ExhaustFanControl);
   server.on("/api/bin1/pump", HTTP_POST, handleBin1PumpControl);
  
    server.on("/api/bin2/intake-fan", HTTP_POST, handleBin2IntakeFanControl);
     server.on("/api/bin2/exhaust-fan", HTTP_POST, handleBin2ExhaustFanControl);
    server.on("/api/bin2/pump", HTTP_POST, handleBin2PumpControl);
  
   server.on("/api/peltier/main", HTTP_POST, handlePeltierMainControl);
    server.on("/api/peltier/pump", HTTP_POST, handlePeltierPumpControl);
    
    // Settings routes
    server.on("/api/reset-registration", HTTP_POST, []() {
      if (!requireLogin()) return;
      handleResetRegistration();
    });
    server.on("/api/factory-reset", HTTP_POST, handleFactoryReset);
    
    // ✅ NEW: WiFi API routes
    server.on("/api/wifi/status", HTTP_GET, handleWiFiStatus);
    server.on("/api/wifi/scan", HTTP_GET, handleScanNetworks);
    server.on("/api/wifi/connect", HTTP_POST, handleConnectWiFi);
    server.on("/api/wifi/disconnect", HTTP_POST, handleDisconnectWiFi);
    
    // Data & assets routes
    server.on("/data", HTTP_GET, []() {
      if (!requireLogin()) return;
      handleData();
    });
    server.on("/styles.css", handleCSS);
    server.on("/api/device-id", HTTP_GET, handleDeviceID);
    server.onNotFound(handleNotFound);

      // ✅ ACTUATOR CONTROL ROUTES (8 endpoints)
  server.on("/api/bin1/intake-fan", HTTP_POST, handleBin1IntakeFanControl);
  server.on("/api/bin1/exhaust-fan", HTTP_POST, handleBin1ExhaustFanControl);
  server.on("/api/bin1/pump", HTTP_POST, handleBin1PumpControl);
  
  server.on("/api/bin2/intake-fan", HTTP_POST, handleBin2IntakeFanControl);
  server.on("/api/bin2/exhaust-fan", HTTP_POST, handleBin2ExhaustFanControl);
  server.on("/api/bin2/pump", HTTP_POST, handleBin2PumpControl);
  
  server.on("/api/peltier/main", HTTP_POST, handlePeltierMainControl);
  server.on("/api/peltier/pump", HTTP_POST, handlePeltierPumpControl);
    
    server.begin();
    Serial.println("✅ Web Server started");
    Serial.println("📱 Access at: http://192.168.4.1");
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("📱 Also at: http://" + WiFi.localIP().toString());
    }
  }
  
  // Clear serial buffer
  while(SERIAL_COMM.available()) {
    SERIAL_COMM.read();
  }
  Serial.println("✅ Setup complete!\n");
  Serial.printf("sizeof(SensorData) = %d bytes\n", sizeof(SensorData));
}

// ====== ADD THESE NEW API HANDLERS ======

void handleScanNetworks() {
  Serial.println("🔍 Scanning WiFi networks...");
  
  // ✅ IMPORTANT: Ensure we're in STA or AP_STA mode
  WiFi.mode(WIFI_AP_STA);
  delay(100);  // Give WiFi time to switch modes
  
  // ✅ Disconnect from any current connection to free up radio
  WiFi.disconnect();
  delay(100);
  
  // ✅ Scan with explicit settings
  int n = WiFi.scanNetworks(false, true, false, 300);  
  // Parameters: async=false, show_hidden=true, passive=false, max_ms_per_chan=300
  
  Serial.printf("📡 Scan result: %d\n", n);
  
  if (n == -2) {
    server.send(500, "application/json", 
      "{\"error\":\"Scan already in progress\"}");
    return;
  }
  
  if (n == -1) {
    server.send(500, "application/json", 
      "{\"error\":\"Scan failed - WiFi hardware issue\"}");
    return;
  }
  
  if (n == 0) {
    server.send(200, "application/json", 
      "{\"networks\":[],\"message\":\"No networks found\"}");
    return;
  }
  
  // ✅ Build JSON response
  String json = "{\"networks\":[";
  
  for (int i = 0; i < n; i++) {
    if (i > 0) json += ",";
    json += "{";
    json += "\"ssid\":\"" + WiFi.SSID(i) + "\",";
    json += "\"rssi\":" + String(WiFi.RSSI(i)) + ",";
    json += "\"channel\":" + String(WiFi.channel(i)) + ",";
    
    // Encryption type
    String encType = "open";
    switch(WiFi.encryptionType(i)) {
      case WIFI_AUTH_OPEN: encType = "open"; break;
      case WIFI_AUTH_WEP: encType = "WEP"; break;
      case WIFI_AUTH_WPA_PSK: encType = "WPA"; break;
      case WIFI_AUTH_WPA2_PSK: encType = "WPA2"; break;
      case WIFI_AUTH_WPA_WPA2_PSK: encType = "WPA/WPA2"; break;
      case WIFI_AUTH_WPA2_ENTERPRISE: encType = "WPA2-EAP"; break;
      default: encType = "unknown";
    }
    json += "\"encryption\":\"" + encType + "\"";
    json += "}";
  }
  
  json += "],\"count\":" + String(n) + "}";
  
  Serial.printf("✅ Found %d networks\n", n);
  server.send(200, "application/json", json);
  
  // ✅ Clean up scan results
  WiFi.scanDelete();
  
  // ✅ Restart AP mode (in case it was affected)
  WiFi.softAP(ap_ssid, ap_password);
}

// POST /api/wifi/connect - Connect to a WiFi network
void handleConnectWiFi() {
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"No data received\"}");
    return;
  }
  
  String body = server.arg("plain");
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, body);
  
  if (error) {
    server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    return;
  }
  
  String ssid = doc["ssid"] | "";
  String password = doc["password"] | "";
  
  if (ssid.length() == 0) {
    server.send(400, "application/json", "{\"error\":\"SSID required\"}");
    return;
  }
  
  Serial.println("📡 Connecting to WiFi: " + ssid);
  
  // ✅ RESPOND IMMEDIATELY (non-blocking response)
  server.send(202, "application/json", 
    "{\"success\":true,\"message\":\"Connecting to " + ssid + "... Please wait.\"}");
  
  // ✅ Use WiFiManager to save credentials and connect
  WiFiManager wm;
  
  // Disable captive portal and debug
  wm.setConfigPortalBlocking(false);
  wm.setDebugOutput(false);
  
  // Set WiFi credentials
  WiFi.mode(WIFI_AP_STA); // Keep AP running
  WiFi.begin(ssid.c_str(), password.c_str());
  
  // Wait for connection (with timeout)
  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 30000) {
    delay(100);
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi connected successfully!");
    Serial.println("📍 IP Address: " + WiFi.localIP().toString());
    
    // ✅ Credentials are automatically saved by ESP32 WiFi library
    // On next boot, WiFi.begin() will use these saved credentials
    
    // Queue user sync if registered
    if (isUserRegistered()) {
      syncUserToBackend();
    }
  } else {
    Serial.println("❌ WiFi connection failed");
    WiFi.disconnect();
  }
}

// POST /api/wifi/disconnect - Disconnect from WiFi
void handleDisconnectWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    server.send(400, "application/json", 
      "{\"error\":\"Not connected to WiFi\"}");
    return;
  }
  
  String ssid = WiFi.SSID();
  
  // ✅ Use WiFiManager to clear saved credentials
  WiFiManager wm;
  wm.resetSettings();
  
  // Disconnect
  WiFi.disconnect(true, true); // Disconnect and erase credentials
  
  // Keep AP running
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ap_ssid, ap_password);
  
  Serial.println("📡 Disconnected from: " + ssid);
  Serial.println("✅ WiFi credentials cleared");
  
  server.send(200, "application/json", 
    "{\"success\":true,\"message\":\"Disconnected from WiFi and cleared saved credentials\"}");
}

// ====== OPTIONAL: Add this helper function for better WiFi management ======

// Function to check and reconnect WiFi in loop()
void checkWiFiConnection() {
  static unsigned long lastCheck = 0;
  static bool wasConnected = false;
  
  // Check every 10 seconds
  if (millis() - lastCheck < 10000) return;
  lastCheck = millis();
  
  bool isConnected = (WiFi.status() == WL_CONNECTED);
  
  // Connection state changed
  if (isConnected != wasConnected) {
    if (isConnected) {
      Serial.println("✅ WiFi connected: " + WiFi.SSID());
      Serial.println("📍 IP Address: " + WiFi.localIP().toString());
      
      // Try to sync user data
      if (isUserRegistered()) {
        syncUserToBackend();
      }
    } else {
      Serial.println("⚠️ WiFi disconnected");
    }
    wasConnected = isConnected;
  }
  
  // Try to reconnect if disconnected (using saved credentials)
  if (!isConnected && WiFi.getMode() == WIFI_AP_STA) {
    Serial.println("🔄 Attempting WiFi reconnection...");
    WiFi.begin(); // Use saved credentials
  }
} 

// GET /api/wifi/status - Check WiFi connection status 
void handleWiFiStatus() {
  String json = "{";
  json += "\"connected\":" + String(WiFi.status() == WL_CONNECTED ? "true" : "false");
  
  if (WiFi.status() == WL_CONNECTED) {
    json += ",\"ssid\":\"" + WiFi.SSID() + "\"";
    json += ",\"ip\":\"" + WiFi.localIP().toString() + "\"";
    json += ",\"rssi\":" + String(WiFi.RSSI());
    json += ",\"gateway\":\"" + WiFi.gatewayIP().toString() + "\"";
  }
  
  json += "}";
  server.send(200, "application/json", json);
}

// ✅ Check if device is claimed (only if no local user exists)
void checkIfClaimed() {
  static unsigned long lastCheck = 0;
  static bool alreadyClaimed = false;
  
  // Don't check if already claimed
  if (alreadyClaimed || isUserRegistered()) {
    alreadyClaimed = true;
    return;
  }
  
  // Check every 60 seconds
  if (millis() - lastCheck < 60000) return;
  lastCheck = millis();
  
  // Request credentials via MQTT
if (client.connected()) {
    String requestTopic = "commands/" + deviceID + "/request-credentials";
    String payload = "{\"espID\":\"" + deviceID + "\"}";
    
    client.publish(requestTopic.c_str(), payload.c_str());
    Serial.println("🔍 Checking if device has been claimed...");
  } else {
    Serial.println("⚠️ MQTT not connected, skipping claim check");
  }
}

void loop() {
  server.handleClient();
   processPendingSync();
  checkWiFiConnection();  // ← ADD THIS LINE
  checkIfClaimed();
  unsigned long currentMillis = millis();


    // ✅✅✅ ADD THIS DEBUG CODE (NEW) ✅✅✅
  static unsigned long lastSerialCheck = 0;
  if (currentMillis - lastSerialCheck > 1000) {  // Check every 1 second
    lastSerialCheck = currentMillis;
    int available = SERIAL_COMM.available();
    
    if (available > 0) {
      Serial.printf("📨 Serial2: %d bytes available\n", available);
    } else {
      Serial.println("⚠️ Serial2: NO DATA RECEIVED");
    }
  }
  // Continuously check for incoming data from slave
  receiveDataFromSlave();

if (currentMillis - lastLogTime >= LOG_INTERVAL) {
    lastLogTime = currentMillis;

    // 1. Prepare the log entry
    LogEntry entry;
    
    // Format timestamp from RTC
    DateTime now = rtc.now();
    snprintf(entry.timestamp, 25, "%04d-%02d-%02dT%02d:%02d:%02dZ", 
             now.year(), now.month(), now.day(), now.hour(), now.minute(), now.second());

    // 2. Fill Data (Use 0 if no data received yet)
    entry.temp1 = bin1DataReceived ? bin1Data.temp : 0;
    entry.hum1  = bin1DataReceived ? bin1Data.humidity : 0;
    entry.soil1 = bin1DataReceived ? bin1Data.soil_percent : 0;
    entry.gas1  = bin1DataReceived ? bin1Data.gas_ppm : 0;
    
    entry.temp2 = bin2DataReceived ? bin2Data.temp : 0;
    entry.hum2  = bin2DataReceived ? bin2Data.humidity : 0;
    entry.soil2 = bin2DataReceived ? bin2Data.soil_percent : 0;
    entry.gas2  = bin2DataReceived ? bin2Data.gas_ppm : 0;
    
    entry.peltierState = peltierDataReceived ? peltierData.peltier_main_state : false;

    // 3. Send to Background Task
    SDStore::enqueueLog(entry);
}

// ✅ NEW: Check for offline logs to sync
if (WiFi.status() == WL_CONNECTED && client.connected()) {
    static unsigned long lastSyncCheck = 0;
    // Check every 5 seconds if we have old logs to upload
    if (millis() - lastSyncCheck > 5000) { 
        lastSyncCheck = millis();
        SDStore::handleSync(client); 
    }
}

// Handle MQTT connection and communication.
if (WiFi.status() == WL_CONNECTED) {
  if (!client.connected()) {
    reconnectMQTT();
  } else {
    client.loop(); // Process MQTT messages.
  }
}

// Publish sensor data at a regular interval ONLY if connected.
static unsigned long lastMqttPublish = 0;
if (client.connected() && (currentMillis - lastMqttPublish > 5000)) {
  lastMqttPublish = currentMillis;
  publishSensorData();
}
}

// ====== Generate Device ID from MAC Address ======
String generateDeviceID() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char macStr[25];
  sprintf(macStr, "AVONIC-%02X%02X%02X%02X%02X%02X", 
          mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return String(macStr);
}

// ✅ NEW: Receive data from slave via Serial
void receiveDataFromSlave() {
  static byte buffer[sizeof(SensorData) * 2 + sizeof(PeltierData) + 10];
  static int bufferIndex = 0;
  static bool receiving = false;
  static uint16_t expectedSize = 0;
  
  while (SERIAL_COMM.available() > 0) {
    byte inByte = SERIAL_COMM.read();
    
    if (!receiving) {
      static byte byte1 = 0, byte2 = 0;
      if (byte1 == START_MARKER_1 && byte2 == START_MARKER_2 && inByte == START_MARKER_3) {
        receiving = true;
        bufferIndex = 0;
        Serial.println("🔵 Start marker detected");
      }
      byte1 = byte2;
      byte2 = inByte;
    }
    else {
      buffer[bufferIndex++] = inByte;
      
      if (bufferIndex == 2) {
        expectedSize = buffer[0] | (buffer[1] << 8);
        Serial.printf("📏 Expected size: %d bytes\n", expectedSize);
      }
      
      if (bufferIndex >= 2 && bufferIndex == expectedSize + 5) {
        if (buffer[bufferIndex-2] == END_MARKER && buffer[bufferIndex-1] == END_MARKER) {
          Serial.println("🔵 End marker detected");
          
          byte calculatedChecksum = 0;
          for (int i = 2; i < bufferIndex - 3; i++) {
            calculatedChecksum ^= buffer[i];
          }
          
          byte receivedChecksum = buffer[bufferIndex - 3];
          
          if (calculatedChecksum == receivedChecksum) {
            // ✅ Extract ALL data (Bin1 + Bin2 + Peltier)
            memcpy(&bin1Data, buffer + 2, sizeof(SensorData));
            memcpy(&bin2Data, buffer + 2 + sizeof(SensorData), sizeof(SensorData));
            memcpy(&peltierData, buffer + 2 + sizeof(SensorData) * 2, sizeof(PeltierData));
            
            bin1DataReceived = true;
            bin2DataReceived = true;
            peltierDataReceived = true;
            bin1LastUpdate = millis();
            bin2LastUpdate = millis();
            
            Serial.printf("✅ Valid packet! Bin1: T=%.1f | Bin2: Gas=%d | Peltier: Main=%s\n",
                         bin1Data.temp, bin2Data.gas_ppm, 
                         peltierData.peltier_main_state ? "ON" : "OFF");
          } else {
            Serial.printf("❌ Checksum mismatch! Got 0x%02X, expected 0x%02X\n", 
                         receivedChecksum, calculatedChecksum);
          }
        }
        
        receiving = false;
        bufferIndex = 0;
        expectedSize = 0;
        return;
      }
      
      if (bufferIndex >= sizeof(buffer)) {
        Serial.println("❌ Buffer overflow!");
        receiving = false;
        bufferIndex = 0;
        expectedSize = 0;
      }
    }
  }
}



// ====== MQTT Functions ======
void reconnectMQTT() {
  static unsigned long lastAttempt = 0;
  // Only attempt to reconnect every 30 seconds.
  if (millis() - lastAttempt < 30000) {
    return;
  }
  lastAttempt = millis();

  if (!client.connected()) {
    Serial.print("🔄 Connecting to MQTT...");
    String clientId = "AVONIC-Master-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println(" ✅ Connected!");
      
      // ✅ Subscribe to general topics
      client.subscribe("avonic/#");
      
// ✅ Subscribe to device-specific topics
      String claimedTopic = "commands/" + deviceID + "/claimed";
      String syncTopic = "commands/" + deviceID + "/sync-credentials";
      String passwordTopic = "commands/" + deviceID + "/password-updated";
      
      client.subscribe(claimedTopic.c_str(), 1);
      client.subscribe(syncTopic.c_str(), 1);
      client.subscribe(passwordTopic.c_str(), 1);
      
      Serial.println("✅ Resubscribed to device topics");
      
// ✅ Request credentials if not registered
      if (!isUserRegistered()) {
        String requestTopic = "commands/" + deviceID + "/request-credentials";
        String payload = "{\"espID\":\"" + deviceID + "\"}";
        client.publish(requestTopic.c_str(), payload.c_str());
        Serial.println("📤 Requested credentials after reconnect");
      }
      
    } else {
      Serial.print(" ❌ Failed, rc=");
      Serial.println(client.state());
    }
  }
}

void publishSensorData() {
  if (!client.connected()) {
    Serial.println("⚠️ MQTT not connected — skipping publish");
    return;
  }

  String payload = "{";
  payload += "\"espID\":\"" + deviceID + "\",";
  
  // BIN 1
  payload += "\"bin1\":{";
  if (bin1DataReceived) {
    payload += "\"temp\":" + String(bin1Data.temp, 1) + ",";
    payload += "\"humidity\":" + String(bin1Data.humidity, 1) + ",";
    payload += "\"soil\":" + String(bin1Data.soil_percent) + ",";
    payload += "\"gas\":" + String(bin1Data.gas_ppm) + ",";
    payload += "\"ds18b20\":" + String(bin1Data.ds18b20_temp, 2) + ",";
    payload += "\"ultrasonic\":" + String(bin1Data.ultrasonic_distance) + ",";
    payload += "\"intake_fan\":" + String(bin1Data.intake_fan_state) + ",";
    payload += "\"exhaust_fan\":" + String(bin1Data.exhaust_fan_state) + ",";
    payload += "\"pump\":" + String(bin1Data.pump_state);
  } else {
    payload += "\"status\":\"no_data\"";
  }
  payload += "},";
  
  // BIN 2
  payload += "\"bin2\":{";
  if (bin2DataReceived) {
    payload += "\"temp\":" + String(bin2Data.temp, 1) + ",";
    payload += "\"humidity\":" + String(bin2Data.humidity, 1) + ",";
    payload += "\"soil\":" + String(bin2Data.soil_percent) + ",";
    payload += "\"gas\":" + String(bin2Data.gas_ppm) + ",";
    payload += "\"water_level\":" + String(bin2Data.water_level) + ",";
    payload += "\"intake_fan\":" + String(bin2Data.intake_fan_state) + ",";
    payload += "\"exhaust_fan\":" + String(bin2Data.exhaust_fan_state) + ",";
    payload += "\"pump\":" + String(bin2Data.pump_state);
  } else {
    payload += "\"status\":\"no_data\"";
  }
  payload += "},";
  
  // ✅ NEW: PELTIER
  payload += "\"peltier\":{";
  if (peltierDataReceived) {
    payload += "\"main\":" + String(peltierData.peltier_main_state) + ",";
    payload += "\"pump\":" + String(peltierData.peltier_pump_state);
  } else {
    payload += "\"status\":\"no_data\"";
  }
  payload += "},";

  payload += "\"system\":{";
  payload += "\"uptime\":" + String(millis() / 1000);
  payload += "}}";

  const char* topic = "avonic/sensors";
  bool published = client.publish(topic, payload.c_str(), false);
  
  if (published) {
    Serial.println("📤 Published to MQTT: " + String(topic));
  } else {
    Serial.println("❌ MQTT publish failed! State: " + String(client.state()));
  }
}

void publishUserData(String deviceID, String username, String email, String passwordHash) {
  if (!client.connected()) {
    Serial.println("⚠️ MQTT not connected — skipping user publish");
    return;
  }

  // Build JSON payload
  String payload = "{";
  payload += "\"espID\":\"" + deviceID + "\",";  // ✅ Changed to espID
  payload += "\"username\":\"" + username + "\",";
  payload += "\"email\":\"" + email + "\",";
  payload += "\"password\":\"" + passwordHash + "\"";
  payload += "}";

  const char* topic = "avonic/users";
  
  Serial.println("📤 Publishing user data...");
  Serial.println("   Topic: " + String(topic));
  Serial.println("   Payload: " + payload);
  
  bool published = client.publish(topic, payload.c_str(), false); // QoS 0

  if (published) {
    Serial.println("✅ User data published successfully!");
  } else {
    Serial.println("❌ FAILED to publish user data!");
    Serial.println("   MQTT state: " + String(client.state()));
    Serial.println("   Payload length: " + String(payload.length()));
  }
}


void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) message += (char)payload[i];
  
  String topicStr = String(topic);
  Serial.println("📥 MQTT [" + topicStr + "]");

  // ====== Handle Actuator Control Commands ======
  if (topicStr.endsWith("/actuator-control")) {
    Serial.println("🎮 ACTUATOR CONTROL RECEIVED!");
    Serial.println("Raw message: " + message);
    
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (error) {
      Serial.println("❌ Failed to parse actuator command JSON");
      return;
    }
    
    int bin = doc["bin"] | 0;            // 1, 2, or 0 (for peltier)
    String device = doc["device"] | ""; // "fan", "intake-fan", "pump", "peltier-main", etc.
    int state = doc["state"] | 0;       // 1=ON, 0=OFF
    
    if (device.length() == 0) {
      Serial.println("⚠️ Invalid actuator command format");
      return;
    }
    
    byte command[3];
    command[2] = 0xFF; // End Marker
    command[1] = state; // State

    // ✅ NEW LOGIC: Handle generic "fan" command (Trigger BOTH Intake + Exhaust)
    if (bin == 1 && device == "fan") {
      // 1. Send Intake Command
      command[0] = CMD_BIN1_INTAKE_FAN;
      SERIAL_COMM.write(command, 3);
      Serial.println("🌬️ Bin 1 Intake Fan → " + String(state ? "ON" : "OFF"));
      
      delay(50); // Small delay to prevent serial collision

      // 2. Send Exhaust Command
      command[0] = CMD_BIN1_EXHAUST_FAN;
      SERIAL_COMM.write(command, 3);
      Serial.println("🌬️ Bin 1 Exhaust Fan → " + String(state ? "ON" : "OFF"));
      return; // Stop here, we handled it
    }
    else if (bin == 2 && device == "fan") {
      // 1. Send Intake Command
      command[0] = CMD_BIN2_INTAKE_FAN;
      SERIAL_COMM.write(command, 3);
      Serial.println("🌬️ Bin 2 Intake Fan → " + String(state ? "ON" : "OFF"));

      delay(50); 

      // 2. Send Exhaust Command
      command[0] = CMD_BIN2_EXHAUST_FAN;
      SERIAL_COMM.write(command, 3);
      Serial.println("🌬️ Bin 2 Exhaust Fan → " + String(state ? "ON" : "OFF"));
      return; // Stop here
    }

    // ✅ STANDARD MAPPING (For individual controls)
    if (bin == 1 && device == "intake-fan") {
      command[0] = CMD_BIN1_INTAKE_FAN;
      Serial.println("🌬️ Bin 1 Intake Fan → " + String(state ? "ON" : "OFF"));
    } 
    else if (bin == 1 && device == "exhaust-fan") {
      command[0] = CMD_BIN1_EXHAUST_FAN;
      Serial.println("🌬️ Bin 1 Exhaust Fan → " + String(state ? "ON" : "OFF"));
    } 
    else if (bin == 1 && device == "pump") {
      command[0] = CMD_BIN1_PUMP;
      Serial.println("💧 Bin 1 Pump → " + String(state ? "ON" : "OFF"));
    } 
    else if (bin == 2 && device == "intake-fan") {
      command[0] = CMD_BIN2_INTAKE_FAN;
      Serial.println("🌬️ Bin 2 Intake Fan → " + String(state ? "ON" : "OFF"));
    } 
    else if (bin == 2 && device == "exhaust-fan") {
      command[0] = CMD_BIN2_EXHAUST_FAN;
      Serial.println("🌬️ Bin 2 Exhaust Fan → " + String(state ? "ON" : "OFF"));
    } 
    else if (bin == 2 && device == "pump") {
      command[0] = CMD_BIN2_PUMP;
      Serial.println("💧 Bin 2 Pump → " + String(state ? "ON" : "OFF"));
    }
    else if (device == "peltier-main") {
      command[0] = CMD_PELTIER_MAIN;
      Serial.println("❄️ Peltier Main → " + String(state ? "ON" : "OFF"));
    }
    else if (device == "peltier-pump") {
      command[0] = CMD_PELTIER_PUMP;
      Serial.println("💧 Peltier Pump → " + String(state ? "ON" : "OFF"));
    }
    else {
      Serial.println("⚠️ Unknown device: " + device);
      return;
    }
    
    // Send standard command (if not double-fan logic)
    SERIAL_COMM.write(command, 3);
    Serial.printf("✅ Command sent: [0x%02X][0x%02X][0x%02X]\n", command[0], command[1], command[2]);
    return;
  }


  // ✅ SYNC CONFIRMATION HANDLER
  if (topicStr.endsWith("/sync-confirmed")) {
    Serial.println("✅ USER SYNC CONFIRMED BY BACKEND!");
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (!error) {
      bool success = doc["success"] | false;
      String confirmedUsername = doc["username"] | "";
      
      if (success) {
        Serial.println("🎉 Account is now accessible online!");
        Serial.println("   Username: " + confirmedUsername);
        
        // Mark as synced in local storage
        File file = LittleFS.open(USER_CREDS_FILE, "r");
        if (file) {
          StaticJsonDocument<512> credDoc;
          DeserializationError parseError = deserializeJson(credDoc, file);
          file.close();
          
          if (!parseError) {
            credDoc["synced_to_db"] = true;
            credDoc["synced_at"] = millis();
            
            file = LittleFS.open(USER_CREDS_FILE, "w");
            if (file) {
              serializeJson(credDoc, file);
              file.close();
              Serial.println("✅ Local sync status updated");
            }
          }
        }
      }
    }
  }
  
  // ✅ DEVICE CLAIMED NOTIFICATION
  if (topicStr.endsWith("/claimed") || topicStr.endsWith("/sync-credentials")) {
    Serial.println("🔐 Received credentials from backend!");
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (error) {
      Serial.println("❌ Failed to parse credentials JSON");
      Serial.println("Raw message: " + message);
      return;
    }
    
    String username = doc["username"] | "";
    String email = doc["email"] | "";
    String passwordHash = doc["password_hash"] | "";
    
    if (username.length() > 0 && passwordHash.length() > 0) {
      // Save credentials locally
      if (saveUserCredentials(username, email, passwordHash)) {
        Serial.println("✅ Credentials saved for user: " + username);
        Serial.println("🎉 Device is now claimed!");
        
        // Update state
        currentState = STATE_OPERATIONAL;
        saveDeviceState(STATE_OPERATIONAL);
      } else {
        Serial.println("❌ Failed to save credentials");
      }
    } else {
      Serial.println("⚠️ Invalid credentials received");
    }
  }
  
  // ✅ PASSWORD UPDATE HANDLER
  else if (topicStr.endsWith("/password-updated")) {
    Serial.println("🔐 Password update received!");
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (error) {
      Serial.println("❌ Failed to parse password update JSON");
      return;
    }
    
    String newPasswordHash = doc["password_hash"] | "";
    
    if (newPasswordHash.length() > 0) {
      // Update local credentials
      if (LittleFS.exists(USER_CREDS_FILE)) {
        File file = LittleFS.open(USER_CREDS_FILE, "r");
        if (file) {
          StaticJsonDocument<512> credDoc;
          DeserializationError parseError = deserializeJson(credDoc, file);
          file.close();
          
          if (!parseError) {
            credDoc["password_hash"] = newPasswordHash;
            
            file = LittleFS.open(USER_CREDS_FILE, "w");
            if (file) {
              serializeJson(credDoc, file);
              file.close();
              Serial.println("✅ Local password updated!");
            }
          }
        }
      }
    }
  }
  
  // ✅ GENERIC LOGGING (UNCLAIMED, ETC.)
  else {
    Serial.println("Message: " + message.substring(0, 100)); // First 100 chars
  }
}


// ====== API: Get Device ID ======
void handleDeviceID() {
  String json = "{\"device_id\":\"" + deviceID + "\"}";
  server.send(200, "application/json", json);
}

// ====== Serve Dashboard (protected) ======
void handleDashboard() {
  if (!requireLogin()) return;  // Check if logged in
  
  // Serve your existing dashboard (index.html from LittleFS)
  File file = LittleFS.open("/index.html", "r");
  if (!file) {
    server.send(404, "text/plain", "Dashboard not found");
    return;
  }
  server.streamFile(file, "text/html");
  file.close();
}


void handleRoot() {
  File file = LittleFS.open("/index.html", "r");
  if (!file) { 
    server.send(404, "text/plain", "index.html not found"); 
    return; 
  }
  server.streamFile(file, "text/html");
  file.close();
}

void handleCSS() {
  File file = LittleFS.open("/styles.css", "r");
  if (!file) { 
    server.send(404, "text/plain", "styles.css not found"); 
    return; 
  }
  server.streamFile(file, "text/css");
  file.close();
}

void handleData() {
  String json = "{";

  // --- BIN 1 ---
  if (bin1DataReceived) {
    json += "\"battery_percent\":75,";  // Hardcoded for now
    json += "\"temp1\":" + String(bin1Data.temp, 1) + ",";
    json += "\"hum1\":" + String(bin1Data.humidity, 1) + ",";
    json += "\"soil1_percent\":" + String(bin1Data.soil_percent) + ",";
    json += "\"gas1_ppm\":" + String(bin1Data.gas_ppm) + ",";
    json += "\"ds18b20_temp\":" + String(bin1Data.ds18b20_temp, 2) + ",";
    json += "\"ultrasonic\":" + String(bin1Data.ultrasonic_distance) + ",";
    
    // ✅ NEW: Individual fan states
    json += "\"bin1_intake_fan_state\":" + String(bin1Data.intake_fan_state ? "true" : "false") + ",";
    json += "\"bin1_exhaust_fan_state\":" + String(bin1Data.exhaust_fan_state ? "true" : "false") + ",";
    json += "\"bin1_pump_state\":" + String(bin1Data.pump_state ? "true" : "false") + ",";
    
    json += "\"bin1_intake_fan_status\":\"" + String(bin1Data.intake_fan_status) + "\",";
    json += "\"bin1_exhaust_fan_status\":\"" + String(bin1Data.exhaust_fan_status) + "\",";
    json += "\"bin1_pump_status\":\"" + String(bin1Data.pump_status) + "\",";
    
    json += "\"sensor1_ok\":true,";
  } else {
    json += "\"sensor1_ok\":false,";
  }

  // --- BIN 2 ---
  if (bin2DataReceived) {
    json += "\"temp2\":" + String(bin2Data.temp, 1) + ",";
    json += "\"hum2\":" + String(bin2Data.humidity, 1) + ",";
    json += "\"soil2_percent\":" + String(bin2Data.soil_percent) + ",";
    json += "\"gas2_ppm\":" + String(bin2Data.gas_ppm) + ",";
    json += "\"water_level\":" + String(bin2Data.water_level) + ",";
    
    // ✅ NEW: Individual fan states
    json += "\"bin2_intake_fan_state\":" + String(bin2Data.intake_fan_state ? "true" : "false") + ",";
    json += "\"bin2_exhaust_fan_state\":" + String(bin2Data.exhaust_fan_state ? "true" : "false") + ",";
    json += "\"bin2_pump_state\":" + String(bin2Data.pump_state ? "true" : "false") + ",";
    
    json += "\"bin2_intake_fan_status\":\"" + String(bin2Data.intake_fan_status) + "\",";
    json += "\"bin2_exhaust_fan_status\":\"" + String(bin2Data.exhaust_fan_status) + "\",";
    json += "\"bin2_pump_status\":\"" + String(bin2Data.pump_status) + "\",";
    
    json += "\"sensor2_ok\":true,";
  } else {
    json += "\"sensor2_ok\":false,";
  }

  // ✅ NEW: PELTIER DATA
  if (peltierDataReceived) {
    json += "\"peltier_main_state\":" + String(peltierData.peltier_main_state ? "true" : "false") + ",";
    json += "\"peltier_pump_state\":" + String(peltierData.peltier_pump_state ? "true" : "false") + ",";
    json += "\"peltier_main_status\":\"" + String(peltierData.peltier_main_status) + "\",";
    json += "\"peltier_pump_status\":\"" + String(peltierData.peltier_pump_status) + "\",";
    json += "\"peltier_ok\":true,";
  } else {
    json += "\"peltier_ok\":false,";
  }

  // --- SYSTEM INFO ---
  unsigned long uptimeSeconds = millis() / 1000;
  String timeStr = "T+" + String(uptimeSeconds) + "s";

  json += "\"lastUpdate\":\"" + timeStr + "\",";
  json += "\"rtc_time\":\"" + timeStr + "\",";
  json += "\"wifi_connected\":" + String(WiFi.status() == WL_CONNECTED ? "true" : "false") + ",";
  json += "\"mqtt_connected\":" + String(client.connected() ? "true" : "false");

  json += "}";

  server.send(200, "application/json", json);
}

void handleNotFound() {
  String path = server.uri();
  String contentType = "text/plain";
  if      (path.endsWith(".html"))                          contentType = "text/html";
  else if (path.endsWith(".css"))                           contentType = "text/css";
  else if (path.endsWith(".js"))                            contentType = "application/javascript";
  else if (path.endsWith(".svg"))                           contentType = "image/svg+xml";
  else if (path.endsWith(".png"))                           contentType = "image/png";
  else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) contentType = "image/jpeg";
  else if (path.endsWith(".ico"))                           contentType = "image/x-icon";
  else if (path.endsWith(".json"))                          contentType = "application/json";
  else if (path.endsWith(".woff2"))                         contentType = "font/woff2";
  else if (path.endsWith(".woff"))                          contentType = "font/woff";

  File file = LittleFS.open(path, "r");
  if (!file) { 
    server.send(404, "text/plain", "File not found: " + path); 
    return; 
  }
  server.streamFile(file, contentType);
  file.close();
}


void handleForgotPasswordAPI() {
  String body = server.arg("plain");
  StaticJsonDocument<256> doc;
  deserializeJson(doc, body);
  String email = doc["email"] | "";
  
  if (email.length() == 0) {
    server.send(400, "application/json", "{\"error\":\"Email required\"}");
    return;
  }
  
  // ✅ RESPOND IMMEDIATELY
  server.send(202, "application/json", 
    "{\"success\":true,\"message\":\"Request submitted. Check your email.\"}");
  
  // ✅ PUBLISH TO MQTT (non-blocking)
  if (client.connected()) {
    String payload = "{\"device_id\":\"" + deviceID + "\",\"email\":\"" + email + "\"}";
    client.publish("avonic/password-reset-request", payload.c_str(), false);
    Serial.println("📤 Password reset request sent via MQTT");
  } else {
    Serial.println("⚠️ MQTT not connected");
  }
}

void handleResetPasswordAPI() {
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"No data received\"}");
    return;
  }
  
  String body = server.arg("plain");
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, body);
  
  if (error) {
    server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    return;
  }
  
  String token = doc["token"] | "";
  String newPassword = doc["new_password"] | "";
  
  if (token.length() == 0 || newPassword.length() == 0) {
    server.send(400, "application/json", "{\"error\":\"Token and password required\"}");
    return;
  }
  
  // ✅ RESPOND IMMEDIATELY
  server.send(202, "application/json", 
    "{\"success\":true,\"message\":\"Processing password reset...\"}");
  
  // ✅ PUBLISH TO MQTT
  if (client.connected()) {
    String passwordHash = sha256(newPassword);
    String payload = "{\"device_id\":\"" + deviceID + 
                     "\",\"token\":\"" + token + 
                     "\",\"new_password\":\"" + passwordHash + "\"}";
    client.publish("avonic/password-reset", payload.c_str(), false);
    Serial.println("📤 Password reset sent via MQTT");
  } else {
    server.send(503, "application/json", "{\"error\":\"MQTT not connected\"}");
  }
}