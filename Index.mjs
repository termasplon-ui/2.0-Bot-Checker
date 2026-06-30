import { readFileSync, writeFileSync, existsSync } from "fs";

const DB_FILE = "./blacklist.json";
const HISTORY_FILE = "./history.json";

function loadDB() {
  if (!existsSync(DB_FILE)) return new Map();
  try {
    const data = JSON.parse(readFileSync(DB_FILE, "utf-8"));
    return new Map(Object.entries(data));
  } catch {
    return new Map();
  }
}

function saveDB(map) {
  const obj = Object.fromEntries(map);
  writeFileSync(DB_FILE, JSON.stringify(obj, null, 2), "utf-8");
}

class PersistentMap extends Map {
  set(key, value) {
    super.set(key, value);
    saveDB(this);
    return this;
  }
  delete(key) {
    const result = super.delete(key);
    saveDB(this);
    return result;
  }
}

const raw = loadDB();
export const blacklistDB = new PersistentMap(raw);

function loadHistory() {
  if (!existsSync(HISTORY_FILE)) return [];
  try {
    return JSON.parse(readFileSync(HISTORY_FILE, "utf-8"));
  } catch {
    return [];
  }
}

let _historyData = loadHistory();

export const historyDB = {
  add(entry) {
    _historyData.push(entry);
    if (_historyData.length > 500) _historyData = _historyData.slice(-500);
    writeFileSync(HISTORY_FILE, JSON.stringify(_historyData, null, 2), "utf-8");
  },
  getAll() {
    return [..._historyData].reverse();
  },
};
