#!/usr/bin/env node
// Hashtag d'un match : codes de 3 lettres des deux clubs, ex. Villarreal – Paris Saint Germain -> #VILPSG
// Usage : node news/hashtag.js "Villarreal" "Paris Saint Germain"
const codes = require('./teams.json');
const code = (n) => codes[n] || String(n).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
if (require.main === module) console.log('#' + code(process.argv[2]) + code(process.argv[3]));
module.exports = { code };
