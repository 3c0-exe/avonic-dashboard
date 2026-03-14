// utils/helpers.js
const crypto = require('crypto');

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function avg(arr) {
  const filtered = arr.filter(n => n != null && !isNaN(n));
  return filtered.length ? filtered.reduce((a, b) => a + b, 0) / filtered.length : null;
}

function min(arr) {
  const filtered = arr.filter(n => n != null && !isNaN(n));
  return filtered.length ? Math.min(...filtered) : null;
}

function max(arr) {
  const filtered = arr.filter(n => n != null && !isNaN(n));
  return filtered.length ? Math.max(...filtered) : null;
}

module.exports = { sha256, avg, min, max };