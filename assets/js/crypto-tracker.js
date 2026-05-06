/**
 * Crypto Price Tracker v1.0
 * Fetches live market data from CoinGecko (free, no API key)
 * Renders sparkline charts on canvas with artistic color palette
 *
 * Requires: #crypto-grid element with data-loading and data-error attributes
 */
(function() {
  'use strict';

  var COINS = ['bitcoin', 'ethereum', 'tezos', 'solana'];
  var SYMBOLS = { bitcoin: 'BTC', ethereum: 'ETH', tezos: 'XTZ', solana: 'SOL' };
  var NAMES = { bitcoin: 'Bitcoin', ethereum: 'Ethereum', tezos: 'Tezos', solana: 'Solana' };

  // Artistic palette — jade green & terracotta red
  var JADE = '#6b9e7a';
  var JADE_FILL = 'rgba(107,158,122,';
  var TERRA = '#c46b5c';
  var TERRA_FILL = 'rgba(196,107,92,';

  var grid = document.getElementById('crypto-grid');
  if (!grid) return;

  var loadingText = grid.getAttribute('data-loading') || 'Loading...';
  var errorText = grid.getAttribute('data-error') || 'Data unavailable';

  function formatPrice(p) {
    if (p >= 1) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 0.01) return '$' + p.toFixed(4);
    return '$' + p.toFixed(6);
  }

  function drawSparkline(canvas, data, color, fillPrefix) {
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    var pts = data.slice(-168); // last 7 days hourly
    if (pts.length < 2) return;

    var min = Infinity, max = -Infinity;
    for (var i = 0; i < pts.length; i++) {
      if (pts[i] < min) min = pts[i];
      if (pts[i] > max) max = pts[i];
    }
    var range = max - min || 1;
    var pad = 2;

    // Build path points
    var points = [];
    for (var j = 0; j < pts.length; j++) {
      var x = pad + (j / (pts.length - 1)) * (w - pad * 2);
      var y = pad + (1 - (pts[j] - min) / range) * (h - pad * 2);
      points.push([x, y]);
    }

    // Gradient fill under curve
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, fillPrefix + '0.2)');
    grad.addColorStop(1, fillPrefix + '0.02)');

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var k = 1; k < points.length; k++) {
      ctx.lineTo(points[k][0], points[k][1]);
    }
    ctx.lineTo(points[points.length - 1][0], h);
    ctx.lineTo(points[0][0], h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var m = 1; m < points.length; m++) {
      ctx.lineTo(points[m][0], points[m][1]);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function renderCards(coins) {
    var sorted = [];
    for (var i = 0; i < COINS.length; i++) {
      for (var j = 0; j < coins.length; j++) {
        if (coins[j].id === COINS[i]) { sorted.push(coins[j]); break; }
      }
    }

    grid.innerHTML = '';

    for (var c = 0; c < sorted.length; c++) {
      var coin = sorted[c];
      var change = coin.price_change_percentage_24h || 0;
      var isUp = change >= 0;
      var color = isUp ? JADE : TERRA;
      var fillPrefix = isUp ? JADE_FILL : TERRA_FILL;
      var arrow = isUp ? '▲' : '▼';
      var price = formatPrice(coin.current_price);

      var card = document.createElement('div');
      card.className = 'crypto-card';
      card.innerHTML =
        '<div class="crypto-header">' +
          '<span class="crypto-name">' + NAMES[coin.id] + '</span>' +
          '<span class="crypto-symbol">' + SYMBOLS[coin.id] + '</span>' +
        '</div>' +
        '<div class="crypto-price">' + price + '</div>' +
        '<div class="crypto-change ' + (isUp ? 'positive' : 'negative') + '">' +
          arrow + ' ' + Math.abs(change).toFixed(2) + '%' +
        '</div>' +
        '<canvas class="crypto-sparkline"></canvas>';

      grid.appendChild(card);

      var sparkData = coin.sparkline_in_7d && coin.sparkline_in_7d.price;
      if (sparkData && sparkData.length > 0) {
        drawSparkline(card.querySelector('canvas'), sparkData, color, fillPrefix);
      }
    }
  }

  function fetchData() {
    var url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' +
      COINS.join(',') + '&sparkline=true&price_change_percentage=24h';

    fetch(url)
      .then(function(res) {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(renderCards)
      .catch(function() {
        grid.innerHTML = '<div class="crypto-status">' + errorText + '</div>';
      });
  }

  fetchData();
  setInterval(fetchData, 300000); // refresh every 5 min
})();
