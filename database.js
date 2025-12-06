// database.js - simple placeholder for DB interactions using localStorage
// Provides helpers to save/load a results array under the 'results' key.

const DB = (function(){
  function saveRaw(key, data){
    try{ localStorage.setItem(key, JSON.stringify(data)); return true }catch(e){ return false }
  }
  function loadRaw(key){
    const v = localStorage.getItem(key); return v ? JSON.parse(v) : null;
  }

  // Results helpers (array stored under 'results')
  function addResult(result){
    const arr = loadRaw('results') || [];
    arr.unshift(result);
    saveRaw('results', arr);
    return arr;
  }

  function getResults(){ return loadRaw('results') || []; }

  function clearResults(){ saveRaw('results', []); }

  return { saveRaw, loadRaw, addResult, getResults, clearResults };
})();

// Expose DB for pages (simple global, avoids module loading issues)
window.DB = DB;
