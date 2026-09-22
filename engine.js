/* FuelLog engine - pure functions for fuel efficiency between fill-ups. */
(function (root) {
  'use strict';
  var nextId = 1;
  function uid() { return 'f' + (nextId++) + '-' + Math.random().toString(36).slice(2, 8); }

  function addFillUp(list, date, odometer, liters, cost) {
    odometer = Number(odometer); liters = Number(liters); cost = Number(cost);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('date must be YYYY-MM-DD');
    if (!isFinite(odometer) || odometer <= 0) throw new Error('odometer must be positive');
    if (!isFinite(liters) || liters <= 0) throw new Error('liters must be positive');
    if (!isFinite(cost) || cost < 0) throw new Error('cost must be >= 0');
    if (list.length && odometer <= list[list.length - 1].odometer) {
      throw new Error('odometer must be higher than the last fill-up (' + list[list.length - 1].odometer + ')');
    }
    var f = { id: uid(), date: date, odometer: odometer, liters: liters, cost: cost };
    list.push(f);
    return f;
  }

  function removeFillUp(list, id) {
    var n = list.length;
    var kept = list.filter(function (f) { return f.id !== id; });
    list.length = 0;
    kept.forEach(function (f) { list.push(f); });
    return kept.length < n;
  }

  // per-fill-up segments: distance/efficiency attributed to THIS fill-up's fuel
  function segments(list) {
    var out = [];
    for (var i = 1; i < list.length; i++) {
      var km = list[i].odometer - list[i - 1].odometer;
      out.push({
        fillUp: list[i],
        km: km,
        kmPerLiter: km / list[i].liters,
        costPerKm: list[i].cost / km,
        pricePerLiter: list[i].cost / list[i].liters
      });
    }
    return out;
  }

  function round1(v) { return Math.round(v * 10) / 10; }
  function round2(v) { return Math.round(v * 100) / 100; }

  function stats(list) {
    var segs = segments(list);
    if (!list.length) return { fillUps: 0 };
    var totalKm = list.length > 1 ? list[list.length - 1].odometer - list[0].odometer : 0;
    var totalLiters = 0, totalCost = 0;
    segs.forEach(function (s) { totalLiters += s.fillUp.liters; totalCost += s.fillUp.cost; });
    var avgEff = totalLiters ? totalKm / totalLiters : null;
    var last = segs.length ? segs[segs.length - 1] : null;
    // trend: last segment efficiency vs running average of the ones before it
    var trend = null;
    if (segs.length >= 2) {
      var priorKm = 0, priorL = 0;
      for (var i = 0; i < segs.length - 1; i++) { priorKm += segs[i].km; priorL += segs[i].fillUp.liters; }
      var priorAvg = priorKm / priorL;
      var diff = last.kmPerLiter - priorAvg;
      trend = Math.abs(diff) < priorAvg * 0.03 ? 'steady' : diff > 0 ? 'improving' : 'worsening';
    }
    return {
      fillUps: list.length,
      totalKm: totalKm,
      totalCost: round2(totalCost),
      avgKmPerLiter: avgEff ? round2(avgEff) : null,
      lastKmPerLiter: last ? round2(last.kmPerLiter) : null,
      lastCostPerKm: last ? round2(last.costPerKm) : null,
      lastPricePerLiter: last ? round2(last.pricePerLiter) : null,
      trend: trend
    };
  }

  var api = { addFillUp: addFillUp, removeFillUp: removeFillUp, segments: segments, stats: stats };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FuelLog = api;
})(typeof window !== 'undefined' ? window : this);
