// Centralized script for calculator, dashboard and results
// Provides: calculator save, mini-calc, results rendering, entry count

(function(){
  function escapeHTML(s){ return String(s).replace(/[&<>\"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]; }); }

  function saveResult(item){
    try{
      if(window.DB && typeof window.DB.addResult === 'function'){
        window.DB.addResult(item);
      } else {
        const arr = JSON.parse(localStorage.getItem('results')||'[]'); arr.unshift(item); localStorage.setItem('results', JSON.stringify(arr));
      }
      return true;
    }catch(e){ console.warn('saveResult failed', e); return false }
  }

  function getResults(){
    try{ return (window.DB && window.DB.getResults) ? window.DB.getResults() : JSON.parse(localStorage.getItem('results')||'[]'); }
    catch(e){ return [] }
  }

  function renderResultsInto(container){
    const results = getResults();
    if(!results || results.length === 0){ container.innerHTML = '<p class="text-muted">No results found.</p>'; return; }
    let html = '<table class="result-table"><thead><tr><th>Month</th><th>kWh</th><th>Cost/kWh</th><th>Total</th><th>Date</th></tr></thead><tbody>';
    for(const r of results){ const date = r.createdAt ? new Date(r.createdAt).toLocaleString() : ''; html += `<tr><td>${escapeHTML(r.month||'')}</td><td>${escapeHTML(String(r.power||''))}</td><td>₱${escapeHTML(String(r.cost||''))}</td><td>₱${escapeHTML(String(r.total||''))}</td><td>${escapeHTML(date)}</td></tr>`; }
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function updateEntriesCount(){
    const el = document.getElementById('entriesCount');
    if(!el) return;
    try{ const arr = getResults(); el.innerText = arr.length; }catch(e){ el.innerText = '0' }
  }

  function initCalculatorPage(){
    const btn = document.getElementById('calcBtn');
    if(!btn) return;
    btn.addEventListener('click', function(){
      const month = document.getElementById('month').value || new Date().toLocaleString();
      const power = parseFloat(document.getElementById('power').value);
      const cost = parseFloat(document.getElementById('cost').value);
      const resultEl = document.getElementById('result');
      if(isNaN(power) || isNaN(cost)){ resultEl.innerText = 'Please complete all fields.'; return; }
      const total = power * cost;
      resultEl.innerText = 'Total Bill: ₱' + total.toFixed(2);
      const item = { month, power, cost, total: parseFloat(total.toFixed(2)), createdAt: new Date().toISOString() };
      if(saveResult(item)){
        resultEl.innerText += ' — saved';
        updateEntriesCount();
      }
    });
  }

  function initDashboardMini(){
    const btn = document.getElementById('miniCalcBtn');
    if(!btn) return;
    btn.addEventListener('click', function(){
      const p = parseFloat(document.getElementById('miniPower').value);
      const c = parseFloat(document.getElementById('miniCost').value);
      const disp = document.getElementById('miniDisplay');
      if(isNaN(p) || isNaN(c)){ disp.innerText = 'Complete fields'; return; }
      const total = p * c;
      disp.innerText = '₱ ' + total.toFixed(2);
      const item = { month: new Date().toLocaleDateString(), power: p, cost: c, total: parseFloat(total.toFixed(2)), createdAt: new Date().toISOString() };
      if(saveResult(item)) updateEntriesCount();
    });
  }

  function initResultPage(){
    const container = document.getElementById('resultsContainer');
    if(container) renderResultsInto(container);
    const refresh = document.getElementById('refreshBtn'); if(refresh) refresh.addEventListener('click', function(){ if(container) renderResultsInto(container); });
    const clear = document.getElementById('clearBtn'); if(clear) clear.addEventListener('click', function(){ if(!confirm('Clear all saved results?')) return; try{ if(window.DB && window.DB.clearResults) window.DB.clearResults(); else localStorage.setItem('results', '[]'); if(container) renderResultsInto(container); updateEntriesCount(); }catch(e){ console.warn(e) } });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initCalculatorPage();
    initDashboardMini();
    initResultPage();
    updateEntriesCount();
  });

})();
