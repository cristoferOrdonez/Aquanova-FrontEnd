#!/usr/bin/env node
/**
 * inject_censo_las_mercedes.cjs
 *
 * Inyecta las respuestas del CSV "export_censo_estandarizado.csv"
 * al endpoint POST /submissions/onboarding del barrio Las Mercedes.
 *
 * Uso:
 *   FORM_KEY=mi-slug node inject_censo_las_mercedes.cjs
 *   AUTH_TOKEN=xxx   node inject_censo_las_mercedes.cjs   (auto-descubre form_key)
 *
 * Variables de entorno:
 *   FORM_KEY         (requerido) Slug del formulario "Censo de Usuarios"
 *   AUTH_TOKEN       (opcional)  Token Bearer para auto-descubrir el form_key
 *   NEIGHBORHOOD_ID  (opcional)  UUID de "Las Mercedes" si ya se conoce
 *   API_BASE         (opcional)  URL base del API  (default: http://72.62.97.149/api)
 *   DELAY_MS         (opcional)  Delay entre peticiones en ms (default: 400)
 *   DRY_RUN          (opcional)  'true' → solo parsea CSV, no envía nada
 *   CSV_FILE         (opcional)  Ruta al CSV (default: ../export_censo_estandarizado.csv)
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// ─── Configuración ────────────────────────────────────────────────────────────
const API_BASE       = process.env.API_BASE       || 'http://72.62.97.149/api';
const AUTH_TOKEN     = process.env.AUTH_TOKEN     || '';
const DELAY_MS       = parseInt(process.env.DELAY_MS || '400', 10);
const DRY_RUN        = process.env.DRY_RUN === 'true';
const CSV_FILE       = process.env.CSV_FILE
  || path.resolve(__dirname, '../export_censo_estandarizado.csv');

let FORM_KEY         = process.env.FORM_KEY         || '';
let NEIGHBORHOOD_ID  = process.env.NEIGHBORHOOD_ID  || '';

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
function request(url, options = {}, bodyObj = null) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const bodyStr = bodyObj ? JSON.stringify(bodyObj) : null;

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr);

    const req = lib.request(url, { method: options.method || 'GET', headers }, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch { parsed = { raw }; }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: parsed });
        } else {
          const err = new Error(
            (parsed && parsed.message) ? parsed.message : `HTTP ${res.statusCode}`
          );
          err.status = res.statusCode;
          err.data   = parsed;
          reject(err);
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

const apiGet  = (p, token)       => request(`${API_BASE}${p}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
const apiPost = (p, body, token) => request(`${API_BASE}${p}`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} }, body);

// ─── CSV Parser (RFC 4180 simplificado) ──────────────────────────────────────
function parseCSV(content) {
  const rows = [];
  let row   = [];
  let field = '';
  let inQ   = false;

  for (let i = 0; i < content.length; i++) {
    const ch   = content[i];
    const next = content[i + 1];

    if (inQ) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"')            { inQ = false; }
      else                            { field += ch; }
    } else {
      if      (ch === '"')                          { inQ = true; }
      else if (ch === ',')                          { row.push(field); field = ''; }
      else if (ch === '\r' && next === '\n')        { row.push(field); rows.push(row); row = []; field = ''; i++; }
      else if (ch === '\n' || ch === '\r')          { row.push(field); rows.push(row); row = []; field = ''; }
      else                                          { field += ch; }
    }
  }

  // Último campo / fila
  if (field || row.length) { row.push(field); if (row.some(f => f !== '')) rows.push(row); }

  return rows;
}

// ─── Columnas que NO van en responses sino en campos top-level ───────────────
const META_COLS = new Set([
  'ID Respuesta', 'Fecha Creación', 'Recolectado Por', 'Barrio',
  'Estado', 'Latitud', 'Longitud', 'ID Usuario', 'Selecciona el predio',
]);

// ─── Construir payload para /submissions/onboarding ──────────────────────────
function buildPayload(row, formKey, neighborhoodId) {
  const name = row['Recolectado Por']?.trim()
    || `NombreGenerico${Math.floor(1000 + Math.random() * 9000)}`;

  const documentNumber = row['ID Usuario']?.trim()
    || String(Math.floor(100000000 + Math.random() * 900000000));

  const lotId   = row['Selecciona el predio']?.trim() || null;
  const lat     = parseFloat(row['Latitud'] || '');
  const lng     = parseFloat(row['Longitud'] || '');
  const location = (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0)
    ? { lat, lng } : null;

  // Construir objeto responses usando los labels de columna como claves
  const responses = {};

  for (const [col, raw] of Object.entries(row)) {
    if (META_COLS.has(col)) continue;
    const val = (raw || '').trim();
    if (!val) continue;

    // Fotos: pueden ser varias URLs separadas por "; "
    if (col === 'Foto de la fachada del predio') {
      const urls = val.split(';').map(u => u.trim()).filter(Boolean);
      responses[col] = urls;
      continue;
    }

    responses[col] = val;
  }

  const payload = {
    form_key:        formKey,
    neighborhood_id: neighborhoodId,
    responses,
    name,
    document_number: documentNumber,
  };

  if (lotId)    payload.lot_id  = lotId;
  if (location) payload.location = location;

  return payload;
}

// ─── Sleep ────────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   Inyector de Censo — Barrio Las Mercedes        ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  console.log(`API Base : ${API_BASE}`);
  console.log(`CSV File : ${CSV_FILE}`);
  console.log(`DRY RUN  : ${DRY_RUN ? 'SÍ (sin envío real)' : 'NO (envío real)'}`);
  console.log(`Delay    : ${DELAY_MS} ms entre peticiones\n`);

  // ── 1. Obtener neighborhood_id ────────────────────────────────────────────
  if (!NEIGHBORHOOD_ID) {
    process.stdout.write('Buscando "Las Mercedes" en /api/map/neighborhoods... ');
    const res = await apiGet('/map/neighborhoods');
    const list = res.data?.data || res.data || [];
    const barrio = list.find(n =>
      n.name.toLowerCase().includes('mercedes') ||
      n.name.toLowerCase().includes('las mercedes')
    );
    if (!barrio) {
      console.error('\nERROR: Barrio "Las Mercedes" no encontrado.');
      console.error('Barrios disponibles:', list.map(n => `"${n.name}"`).join(', '));
      process.exit(1);
    }
    NEIGHBORHOOD_ID = barrio.id;
    console.log(`OK → "${barrio.name}" (${barrio.code})\n  ID: ${NEIGHBORHOOD_ID}\n`);
  } else {
    console.log(`Neighborhood ID (manual): ${NEIGHBORHOOD_ID}\n`);
  }

  // ── 2. Obtener form_key ───────────────────────────────────────────────────
  if (!FORM_KEY) {
    if (!AUTH_TOKEN) {
      console.error('ERROR: Se requiere FORM_KEY o AUTH_TOKEN.');
      console.error('  Opción A) FORM_KEY=mi-slug node inject_censo_las_mercedes.cjs');
      console.error('  Opción B) AUTH_TOKEN=<token> node inject_censo_las_mercedes.cjs');
      console.error('\nPuedes copiar el token de localStorage en el navegador:');
      console.error('  localStorage.getItem("token")');
      process.exit(1);
    }

    process.stdout.write('Buscando formulario "Censo de Usuarios" en /api/forms... ');
    const res = await apiGet('/forms', AUTH_TOKEN);
    const forms = res.data?.forms || [];
    const form = forms.find(f =>
      f.title?.toLowerCase().includes('censo') ||
      f.key?.toLowerCase().includes('censo') ||
      f.title?.toLowerCase().includes('usuarios')
    );
    if (!form) {
      console.error('\nERROR: No se encontró el formulario.');
      console.error('Formularios disponibles:');
      forms.forEach(f => console.error(`  • "${f.title}" → key: ${f.key}`));
      process.exit(1);
    }
    FORM_KEY = form.key;
    console.log(`OK → "${form.title}"\n  key: ${FORM_KEY}\n`);
  } else {
    console.log(`Form key (manual): ${FORM_KEY}\n`);
  }

  // ── 3. Leer y parsear CSV ─────────────────────────────────────────────────
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`ERROR: Archivo CSV no encontrado: ${CSV_FILE}`);
    process.exit(1);
  }

  const content = fs.readFileSync(CSV_FILE, 'utf8');
  const parsed  = parseCSV(content);

  if (parsed.length < 2) {
    console.error('ERROR: El CSV está vacío o solo tiene encabezado.');
    process.exit(1);
  }

  const headers  = parsed[0].map(h => h.trim());
  const dataRows = parsed.slice(1);

  console.log(`CSV cargado: ${dataRows.length} filas | ${headers.length} columnas`);
  console.log(`Columnas: ${headers.join(' | ')}\n`);

  // ── 4. Filtrar solo filas de "Las Mercedes" ───────────────────────────────
  const lasM = dataRows.filter(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (r[i] || '').trim(); });
    const barrio = (obj['Barrio'] || '').toLowerCase();
    return !barrio || barrio.includes('mercedes');
  });

  console.log(`Filas del barrio Las Mercedes: ${lasM.length}\n`);
  console.log('─'.repeat(60));

  // ── 5. Inyectar fila por fila ─────────────────────────────────────────────
  let ok = 0, fail = 0, skip = 0;

  for (let i = 0; i < lasM.length; i++) {
    const rowArr = lasM[i];
    const row    = {};
    headers.forEach((h, idx) => { row[h] = (rowArr[idx] || '').trim(); });

    const num    = i + 1;
    const nombre = row['Recolectado Por'] || '(sin nombre)';
    const predio = row['Selecciona el predio'] || '(sin predio)';

    process.stdout.write(`[${num}/${lasM.length}] ${nombre} | predio: ${predio.substring(0, 8)}...`);

    if (DRY_RUN) {
      const p = buildPayload(row, FORM_KEY, NEIGHBORHOOD_ID);
      console.log(`\n  DRY RUN → ${JSON.stringify(p).substring(0, 120)}...`);
      ok++;
      continue;
    }

    const payload = buildPayload(row, FORM_KEY, NEIGHBORHOOD_ID);

    const tryPost = async (p, tag = '') => {
      const res = await apiPost('/submissions/onboarding', p);
      const sid  = res.data?.submission_id || res.data?.id || '(ok)';
      console.log(` ✓${tag} → ${sid}`);
      ok++;
    };

    try {
      await tryPost(payload);
    } catch (err) {
      if (err.status === 409 || err.status === 400) {
        // Conflicto de duplicado: reintentar con identidad genérica
        process.stdout.write(` ⚠ [${err.status}] reintentando...`);
        const retry = {
          ...payload,
          name:            `NombreGenerico${Math.floor(1000 + Math.random() * 9000)}`,
          document_number: String(Math.floor(100000000 + Math.random() * 900000000)),
        };
        try {
          await tryPost(retry, ' (retry)');
        } catch (e2) {
          console.log(` ✗ [${e2.status}] ${e2.message}`);
          fail++;
        }
      } else {
        console.log(` ✗ [${err.status}] ${err.message}`);
        if (err.data) console.log(`    ${JSON.stringify(err.data)}`);
        fail++;
      }
    }

    if (DELAY_MS > 0) await sleep(DELAY_MS);
  }

  // ── 6. Resumen ────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('RESUMEN FINAL');
  console.log('═'.repeat(60));
  console.log(`Total procesados : ${lasM.length}`);
  console.log(`✓ Exitosos       : ${ok}`);
  console.log(`✗ Fallidos       : ${fail}`);
  if (skip) console.log(`- Saltados       : ${skip}`);
  console.log('═'.repeat(60));

  if (fail > 0) process.exit(1);
}

main().catch(err => {
  console.error('\nERROR FATAL:', err.message);
  process.exit(1);
});
