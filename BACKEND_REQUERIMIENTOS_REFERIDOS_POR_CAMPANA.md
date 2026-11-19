# Requerimientos de Backend — Referidos por Campaña

**Repo destino:** `desarrollo junio/backend-aquanova`
**Spec funcional:** [`SPEC_REFERIDOS_POR_CAMPANA.md`](./SPEC_REFERIDOS_POR_CAMPANA.md) (contratos CO-01 … CO-13)
**Estado del frontend:** ya implementado y desplegable. Funciona hoy contra los endpoints actuales mediante fallbacks; cada requerimiento de este documento retira uno.
**Fecha:** 2026-07-27

---

## Cómo leer este documento

El frontend **no está bloqueado**. `Aquanova/src/services/referralService.js` intenta primero el endpoint definido en la spec y, si responde `404`/`501`, deriva el dato de los endpoints actuales. Cuando implementes cada endpoint, el fallback deja de ejecutarse solo — **no hay que tocar el frontend**.

> Un `401`, `403` o `500` **no** activa el fallback: se propaga como error a la UI. Esto es deliberado, para que un fallo real no quede disfrazado de "backend viejo".

Prioridades:

| Prioridad | Significado |
|---|---|
| **P0** | Corrige un defecto en producción. El fallback no puede compensarlo del todo. |
| **P1** | El fallback funciona pero entrega datos incompletos o hace N peticiones. |
| **P2** | Mejora de consistencia; el fallback es equivalente. |

---

## Resumen

| # | Requerimiento | Tipo | Prioridad |
|---|---|---|---|
| [R-1](#r-1--corregir-el-tope-de-puntos-para-que-sea-por-campaña) | Tope de puntos por campaña, no global | Corrección | **P0** |
| [R-2](#r-2--construir-el-link-de-referido-con-el-slug-de-la-campaña) | Link de referido con `forms.key` | Corrección | **P0** |
| [R-3](#r-3--get-apiusersmereferral-profile--desglose-por-campaña) | `referral-profile` con `campaigns[]` | Extensión | **P1** |
| [R-4](#r-4--get-apigiveawaysformidranking) | Ranking por campaña | Endpoint nuevo | **P1** |
| [R-5](#r-5--get-apigiveawaysformidactivity) | Actividad por campaña | Endpoint nuevo | **P1** |
| [R-6](#r-6--get-apigiveawayscampaigns) | Listado de campañas con sorteo | Endpoint nuevo | **P2** |
| [R-7](#r-7--get-apigiveawaysmetricsuseruserid--formid) | Perfil de referente acotado a campaña | Extensión | **P2** |
| [R-8](#r-8--get-apigiveawaysmetricsoverview--marca-de-agregación) | `overview` marcado como agregado | Extensión | **P2** |
| [R-9](#r-9--ruta-de-compatibilidad-para-qr-ya-distribuidos) | Compatibilidad de links antiguos | Decisión | **P0 si hay QR impresos** |

**Esquema de datos: sin cambios.** Todo lo pedido se resuelve con las tablas actuales (`giveaway_configs`, `giveaway_points_ledger`, `submission_referrals`, `user_referral_profiles`, `forms`, `form_versions`, `submissions`). El ledger ya imputa por sorteo vía `giveaway_id`.

---

## R-1 — Corregir el tope de puntos para que sea por campaña

**Prioridad P0 · Corrección · Regla RN-09 · Criterio CA-07**

### Problema

`src/models/giveawayModel.js`, dentro de `reconcileSubmission()` (~línea 172):

```js
// Verificar límite máximo de puntos si está configurado
if (max_points_per_user) {
    const [currentPoints] = await connection.query(
        'SELECT total_accumulated_points FROM user_referral_profiles WHERE user_id = ?',
        [referral.referrer_user_id]
    );
    const current = currentPoints[0] ? currentPoints[0].total_accumulated_points : 0;
    if (current >= max_points_per_user) { /* corta */ }
}
```

`max_points_per_user` está configurado **por sorteo** (`giveaway_configs`), pero se compara contra `user_referral_profiles.total_accumulated_points`, que es el **acumulado global del referente en todas las campañas**.

**Consecuencia en producción:** un referente que alcanza el tope de la campaña A deja de ganar puntos en la campaña B, C y en toda campaña futura. Cuantas más campañas existan, antes se congelan todos los referentes. Con el sistema volviéndose multicampaña, esto pasa de ser un caso borde a la norma.

Es el único requerimiento que **el frontend no puede compensar**: los puntos ya se dejaron de otorgar en la base.

### Cambio requerido

Comparar contra los puntos del referente **en ese sorteo**:

```js
if (max_points_per_user) {
    const [[{ points_in_campaign }]] = await connection.query(`
        SELECT COALESCE(SUM(points_earned), 0) AS points_in_campaign
        FROM giveaway_points_ledger
        WHERE user_id = ? AND giveaway_id = ?
    `, [referral.referrer_user_id, giveaway_id]);

    if (points_in_campaign >= max_points_per_user) {
        await connection.query(
            'UPDATE submission_referrals SET is_processed = TRUE WHERE id = ?',
            [referral.id]
        );
        await connection.commit();
        return { reconciled: true, points_awarded: 0, reason: 'max_points_reached_in_campaign' };
    }
}
```

La consulta va dentro de la transacción existente y usa el `giveaway_id` que ya se obtuvo en el PASO 4.

### Postcondiciones

- El tope se evalúa contra `SUM(giveaway_points_ledger.points_earned)` filtrado por `giveaway_id`.
- `user_referral_profiles.total_accumulated_points` sigue siendo el acumulado global y se sigue actualizando igual (PASO 6): pasa a ser un derivado informativo, no un control de negocio.
- Sin `max_points_per_user` configurado, el comportamiento no cambia.

### Verificación

```gherkin
Dado que "Censo A" tiene max_points_per_user = 50
Y el referente acumuló 50 puntos en "Censo A" y 0 en "Censo B"
Cuando se convierte un referido suyo en "Censo B"
Entonces se le acreditan los puntos de "Censo B"
Y un nuevo referido en "Censo A" no le suma puntos
```

### Nota sobre datos históricos

Los referidos que se marcaron `is_processed = TRUE` con `reason: 'max_points_reached'` por el tope global **no recibieron puntos y no se pueden recuperar automáticamente**: quedaron sellados. Para detectar el alcance:

```sql
SELECT sr.id, sr.referrer_user_id, f.title, sr.created_at
FROM submission_referrals sr
JOIN submissions s     ON sr.submission_id  = s.id
JOIN form_versions fv  ON s.form_version_id = fv.id
JOIN forms f           ON fv.form_id        = f.id
LEFT JOIN giveaway_points_ledger gpl ON gpl.submission_referral_id = sr.id
WHERE sr.is_processed = TRUE AND gpl.id IS NULL AND sr.referred_user_id IS NOT NULL;
```

Devuelve los referidos convertidos que nunca generaron asiento en el ledger. Decidir con negocio si se compensan manualmente.

---

## R-2 — Construir el link de referido con el slug de la campaña

**Prioridad P0 · Corrección · Contrato CO-06 · Defectos D-1 y D-2 · Criterio CA-04**

### Problema

`src/controllers/giveawayController.js` (líneas 9-17):

```js
function buildReferralUrl(code, formId = null) {
    const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
    const path = (process.env.REFERRAL_FORM_PATH || '/formulario').replace(/\/$/, '');
    return formId
        ? `${base}${path}/${formId}?ref=${code}`   // ← uuid
        : `${base}${path}?ref=${code}`;            // ← sin campaña
}
```

Los dos modos producen links que **no resuelven** en el frontend:

| Modo | URL generada | Qué pasa |
|---|---|---|
| Sin `formId` (**el que usa `referral-profile` hoy**) | `/formulario?ref=EAL34TM` | La ruta pública es `/formulario/:formKey`. No hay `path='*'` en `<Routes>`. **Área de contenido en blanco.** |
| Con `formId` | `/formulario/{uuid}?ref=EAL34TM` | La ruta resuelve por **slug**: `GET /forms/public/:formKey` → `formModel.findByKey()` busca `WHERE f.key = ?`. Un uuid nunca coincide. **"Formulario no encontrado".** |

Verificado en navegador contra el build actual: `/formulario?ref=ABC123` renderiza únicamente el widget del chatbot; el área de contenido queda vacía.

### Cambio requerido

Construir la URL con `forms.key`:

```js
function buildReferralUrl(code, formKey = null) {
    const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
    const path = (process.env.REFERRAL_FORM_PATH || '/formulario').replace(/\/$/, '');
    // Sin campaña no hay link válido: la ruta pública exige el slug
    if (!formKey) return null;
    return `${base}${path}/${encodeURIComponent(formKey)}?ref=${encodeURIComponent(code)}`;
}
```

Los llamadores reciben `formId` (uuid) desde la query string, así que hay que resolver el slug antes:

```sql
SELECT f.key, f.title, f.is_active, gc.is_active AS giveaway_active
FROM forms f
LEFT JOIN giveaway_configs gc ON gc.form_id = f.id
WHERE f.id = ?
```

### Postcondiciones

- La URL tiene la forma `{FRONTEND_URL}/formulario/{forms.key}?ref={referral_code}`.
- Sin `formKey`, sin sorteo activo o sin `forms.key` publicado → **no se devuelve link**; responder `400` con el motivo (RN-04).
- `GET /api/users/me/referral-qr` pasa a requerir `formId`. Sin él → `400`.
- El QR codifica exactamente esa URL.

### Impacto en el frontend

Hoy el frontend **genera el link y el QR en cliente** (`buildReferralUrl` y `getCampaignQR` en `referralService.js`) precisamente porque el backend no puede producir uno válido. Una vez implementado R-2, se puede volver a delegar en el backend; hasta entonces el frontend no consume `referral-qr`.

### Verificación

```gherkin
Cuando un referente pide su link para una campaña publicada
Entonces recibe {FRONTEND_URL}/formulario/{slug}?ref={código}
Y al abrirlo se renderiza el formulario público de esa campaña
Y el código queda capturado en la sesión
```

---

## R-3 — `GET /api/users/me/referral-profile` · desglose por campaña

**Prioridad P1 · Extensión · Contrato CO-05 · Criterio CA-05**

### Situación

El endpoint devuelve solo el acumulado global:

```json
{ "referral_code": "EAL34TM", "referral_url": "...", "total_accumulated_points": 45 }
```

El frontend necesita puntos, posición y link **por campaña**. Sin esto, deriva el dato así: perfil global → `GET /forms` (campañas activas) → `GET /giveaways/:formId/leaderboard?limit=200` **por cada campaña**.

**Dos problemas del fallback:**
1. **N peticiones** (~11 según `giveaway_configs`) cada vez que se abre `/referidos/perfil`.
2. **Dato potencialmente incorrecto:** si el referente cae fuera del top 200 de una campaña, se le muestra **0 puntos** en esa campaña. Es el único punto de todo el sistema donde el fallback puede mostrar algo erróneo en vez de simplemente incompleto.

Además `GET /giveaways/metrics/per-form` no sirve aquí: exige rol `adminOrOp` y este endpoint es para cualquier usuario autenticado.

### Respuesta requerida

```json
{
  "ok": true,
  "data": {
    "referral_code": "EAL34TM",
    "total_accumulated_points": 45,
    "is_aggregate": true,
    "campaigns": [
      {
        "form_id": "uuid-...",
        "form_key": "censo-las-mercedes-2026",
        "form_title": "Censo de Usuarios Las Mercedes",
        "is_active": true,
        "points_per_referral": 10,
        "points_in_campaign": 30,
        "referrals_in_campaign": 3,
        "successful_in_campaign": 3,
        "position": 2,
        "referral_url": "https://aquavisor.co/formulario/censo-las-mercedes-2026?ref=EAL34TM"
      }
    ]
  }
}
```

> **No devolver `referral_url` en la raíz.** Ese campo es exactamente el que produce D-1. El link vive dentro de cada campaña.

**Alcance de `campaigns[]` (decisión DA-5, ya confirmada):** incluir **todas las campañas con sorteo activo**, haya invitado o no el referente. Si solo se devolvieran aquellas donde ya tiene referidos, nunca podría obtener su primer link de una campaña nueva. Para campañas sin participación: `points_in_campaign: 0`, `referrals_in_campaign: 0`, `position: null`.

### Consulta sugerida

```sql
SELECT
    f.id                                   AS form_id,
    f.key                                  AS form_key,
    f.title                                AS form_title,
    gc.is_active,
    gc.points_per_referral,
    COALESCE(mine.points, 0)               AS points_in_campaign,
    COALESCE(mine.referrals, 0)            AS referrals_in_campaign
FROM giveaway_configs gc
JOIN forms f ON gc.form_id = f.id
LEFT JOIN (
    SELECT giveaway_id,
           SUM(points_earned) AS points,
           COUNT(id)          AS referrals
    FROM giveaway_points_ledger
    WHERE user_id = ?
    GROUP BY giveaway_id
) mine ON mine.giveaway_id = gc.id
WHERE gc.is_active = TRUE AND f.is_active = TRUE
ORDER BY f.created_at DESC
```

`position` se puede calcular con la misma ventana que usa `getLeaderboard()`, o devolver `null` y dejar que la UI lo omita (ya lo soporta).

`referral_url` se arma con `buildReferralUrl(referral_code, f.key)` de R-2.

---

## R-4 — `GET /api/giveaways/:formId/ranking`

**Prioridad P1 · Endpoint nuevo · Contrato CO-03 · Criterios CA-02, CA-08**

### Situación

Existe `getGlobalRanking()` (ranking global, mezcla campañas) y `getLeaderboard(formId)` (por campaña, público, columnas reducidas). Falta el ranking administrativo por campaña.

El frontend cae hoy a `/giveaways/:formId/leaderboard`, que **sí ordena y posiciona correctamente por campaña** — la regla de negocio principal (CA-02) se cumple. Lo que falta son columnas: `referral_code`, `successful_referrals` y `last_activity` salen vacías, y la UI muestra un aviso al respecto.

### Contrato

```
GET /api/giveaways/:formId/ranking?limit=50
Auth: verifyToken + adminOrOp
```

```json
{
  "ok": true,
  "count": 2,
  "data": [
    {
      "position": 1,
      "user_id": "uuid-...",
      "name": "María López",
      "referral_code": "EAL34TM",
      "total_points": 30,
      "total_referrals": 3,
      "successful_referrals": 3,
      "last_activity": "2026-06-20T14:32:00.000Z"
    }
  ]
}
```

### Consulta sugerida

Es `getGlobalRanking()` acotado por campaña. La diferencia clave: los puntos salen del **ledger filtrado por `giveaway_id`**, no de `urp.total_accumulated_points`.

```sql
SELECT
    ROW_NUMBER() OVER (
        ORDER BY SUM(gpl.points_earned) DESC,
                 COUNT(DISTINCT CASE WHEN sr.is_processed = 1 THEN sr.id END) DESC,
                 MAX(gpl.created_at) ASC,
                 u.id ASC
    )                                AS position,
    u.id                             AS user_id,
    u.name,
    urp.referral_code,
    SUM(gpl.points_earned)           AS total_points,
    COUNT(DISTINCT gpl.id)           AS total_referrals,
    COUNT(DISTINCT CASE WHEN sr.is_processed = 1 THEN sr.id END) AS successful_referrals,
    MAX(gpl.created_at)              AS last_activity
FROM giveaway_points_ledger gpl
JOIN giveaway_configs gc ON gpl.giveaway_id = gc.id
JOIN users u             ON gpl.user_id     = u.id
LEFT JOIN user_referral_profiles urp ON urp.user_id = u.id
LEFT JOIN submission_referrals sr    ON sr.id = gpl.submission_referral_id
WHERE gc.form_id = ?
GROUP BY u.id, u.name, urp.referral_code
ORDER BY total_points DESC
LIMIT ?
```

El `ORDER BY` de `ROW_NUMBER()` implementa el desempate de **RN-06**: puntos → convertidos → actividad más antigua → `user_id`. El último criterio garantiza que el orden sea determinista entre llamadas.

### Postcondiciones

- `position` es densa y contigua desde 1 **dentro de la campaña**.
- Los puntos de otras campañas no afectan orden ni valor (CA-02).
- Campaña sin actividad → `data: []` con `200`, **no** `404` (RN-10, CA-08).

---

## R-5 — `GET /api/giveaways/:formId/activity`

**Prioridad P1 · Endpoint nuevo · Contrato CO-04**

### Situación

El frontend pide `/giveaways/metrics/activity?limit=150` y filtra en cliente por `form_id` (ese campo ya viene en la respuesta de `getRecentActivity()`). Funciona, pero la ventana es global: si una campaña tiene poca actividad y otras la saturan, la actividad antigua de la primera queda fuera. La UI avisa cuando la ventana se llenó.

### Contrato

```
GET /api/giveaways/:formId/activity?limit=30
Auth: verifyToken + adminOrOp
```

Misma forma de fila que `/metrics/activity`.

### Cambio

`getRecentActivity()` ya hace el `JOIN` hasta `forms`. Basta parametrizar:

```js
async getRecentActivity(limit = 30, formId = null) {
    const where  = formId ? 'WHERE f.id = ?' : '';
    const params = formId ? [formId, limit] : [limit];
    // … misma query, insertando `where` antes del ORDER BY
}
```

### Postcondiciones

- Solo referidos de esa campaña, más recientes primero.
- Campaña sin actividad → `data: []` con `200`.

---

## R-6 — `GET /api/giveaways/campaigns`

**Prioridad P2 · Endpoint nuevo · Contrato CO-01 · Criterio CA-01**

### Situación

El frontend usa `/giveaways/metrics/per-form` y lo cruza con `GET /forms` para obtener el slug, calculando `conversion_rate` en cliente. Funciona correctamente; este endpoint solo evita la doble petición y centraliza el orden.

`getStatsPerForm()` ya devuelve casi todo. Le faltan **dos campos**:

- `f.key AS form_key` — sin él no se pueden generar links (por eso el frontend consulta `/forms` aparte).
- `conversion_rate` — calculado.

### Contrato

```
GET /api/giveaways/campaigns
Auth: verifyToken + adminOrOp
```

```json
{
  "ok": true,
  "data": [
    {
      "form_id": "uuid-...",
      "form_key": "censo-las-mercedes-2026",
      "form_title": "Censo de Usuarios Las Mercedes",
      "is_active": true,
      "points_per_referral": 10,
      "max_points_per_user": 50,
      "total_referrals": 12,
      "processed_referrals": 9,
      "pending_referrals": 3,
      "total_points_distributed": 90,
      "active_referrers": 4,
      "conversion_rate": 75.0
    }
  ]
}
```

### Cambio

Sobre `getStatsPerForm()`:

```sql
-- añadir al SELECT:
f.key AS form_key,
ROUND(
    COALESCE(rs.processed_referrals, 0) * 100.0
    / NULLIF(COALESCE(rs.total_referrals, 0), 0),
    1
) AS conversion_rate
```

`NULLIF` evita la división por cero; el frontend ya normaliza `null → 0`.

### Orden (RN-07)

Devolver activas primero, ordenadas por actividad, luego inactivas:

```sql
ORDER BY gc.is_active DESC, total_referrals DESC, f.title ASC
```

El frontend reordena igual por su cuenta, así que esto es consistencia, no dependencia.

### Postcondiciones

- Incluye campañas con sorteo **activo e inactivo** (las inactivas siguen siendo consultables).
- Campaña con sorteo pero sin referidos aparece con contadores en cero (RN-10).

---

## R-7 — `GET /api/giveaways/metrics/user/:userId?formId=`

**Prioridad P2 · Extensión · Contratos CO-11 / CO-12**

### Situación

`getUserReferralDetail()` devuelve `profile`, `by_giveaway[]` y `recent_referrals[]` de todas las campañas. Cuando el admin abre el perfil de un referente **desde una campaña**, el frontend filtra en cliente: recorta `by_giveaway` a esa campaña y filtra `recent_referrals` **comparando `form_title`**.

Comparar por título es frágil: dos campañas con el mismo título mezclarían actividad.

### Cambio

Aceptar `?formId=` opcional:

- `by_giveaway` → solo esa campaña.
- `recent_referrals` → solo referidos de esa campaña (filtrar por `f.id`, no por título).
- `position` → posición **dentro de esa campaña**.
- Sin `formId` → comportamiento actual sin cambios (CO-12).

El frontend ya envía el parámetro y detecta si el backend lo respetó (`by_giveaway.length <= 1`), así que el cambio es retrocompatible en ambos sentidos.

---

## R-8 — `GET /api/giveaways/metrics/overview` · marca de agregación

**Prioridad P2 · Extensión · Contrato CO-13 · Regla RN-05**

Añadir dos campos:

```json
{ "ok": true, "data": { "...": "...", "is_aggregate": true, "campaigns_count": 11 } }
```

`campaigns_count` = número de campañas sumadas (`SELECT COUNT(*) FROM giveaway_configs`).

El frontend ya marca visualmente el alcance global como agregado usando el número de campañas que conoce; esto solo hace la marca autoritativa desde el backend.

---

## R-9 — Ruta de compatibilidad para QR ya distribuidos

**Prioridad P0 si hay material impreso · Decisión de negocio**

Todo QR generado hasta hoy codifica `/formulario?ref=CODE` (D-1) o `/formulario/{uuid}?ref=CODE` (D-2). **Ninguno funciona**, ni antes ni después de este cambio. Si hay QR impresos o compartidos, quedan inservibles salvo que se agregue compatibilidad.

Opciones, en orden de preferencia:

1. **Redirección en el frontend** *(recomendada, no requiere backend)* — ruta `/formulario` sin `formKey` que resuelva a la campaña activa más reciente conservando `?ref=`, o que muestre un selector de campaña. Es la opción reversible y sin riesgo.
2. **Redirección en el backend** — endpoint que reciba `?ref=` sin campaña y responda `302` a la campaña activa más reciente.
3. **No hacer nada** — válido solo si se confirma que no hay QR distribuidos.

**Esta decisión es de negocio, no técnica.** Requiere confirmar si se imprimió o compartió material con los links actuales. Conviene resolverla **antes** de desplegar R-2, porque R-2 cambia la forma del link para todo lo nuevo.

---

## Orden de implementación sugerido

```
R-1  ──▶  detiene la pérdida de puntos en producción (independiente del resto)
R-9  ──▶  decisión de negocio; resolver antes de desplegar R-2
R-2  ──▶  desbloquea links y QR válidos
R-3  ──▶  elimina las N peticiones y el riesgo de puntos en 0
R-4, R-5 ─▶ completan columnas y ventana de datos
R-6, R-7, R-8 ─▶ consistencia
```

R-1 y R-9 son independientes entre sí y del resto: se pueden abordar de inmediato.

---

## Matriz de retirada de fallbacks

Qué deja de ejecutarse en el frontend con cada requerimiento:

| Requerimiento | Fallback que retira | Ubicación en el frontend |
|---|---|---|
| R-2 | Generación de link y QR en cliente (`qrcode`) | `referralService.buildReferralUrl` / `getCampaignQR` |
| R-3 | N× leaderboard para armar el perfil | `referralService.getMyCampaigns` |
| R-4 | Ranking derivado del leaderboard público | `referralService.getCampaignRanking` |
| R-5 | Filtrado de actividad en cliente | `referralService.getCampaignActivity` |
| R-6 | Cruce `per-form` × `GET /forms` | `referralService.getCampaigns` |
| R-7 | Filtrado de `recent_referrals` por título | `referralService.getUserMetrics` |

Ninguno requiere cambios en el frontend: los fallbacks solo se disparan ante `404`/`501`.

---

## Verificación de extremo a extremo

Una vez implementados R-1 a R-6:

```gherkin
Escenario: puntos y ranking aislados por campaña
  Dado un referente con 30 pts en "Censo A" y 100 pts en "Censo B"
  Cuando se consulta el ranking de "Censo A"
  Entonces aparece con 30 puntos
  Y su posición se calcula solo contra participantes de "Censo A"

Escenario: link por campaña
  Cuando el referente pide su link de "Censo A"
  Entonces recibe /formulario/{slug-de-A}?ref={su-código}
  Y al abrirlo se renderiza el formulario de "Censo A" con el código capturado
  Y el link de "Censo B" apunta a un slug distinto

Escenario: tope por campaña
  Dado que "Censo A" tiene max_points_per_user = 50
  Y el referente ya acumuló 50 puntos en "Censo A"
  Cuando se convierte un referido suyo en "Censo B"
  Entonces sí se le acreditan puntos en "Censo B"

Escenario: campaña sin actividad
  Dada una campaña con sorteo y cero referidos
  Cuando se consultan su ranking y su actividad
  Entonces ambos responden 200 con data vacía, no 404
```

---

## Archivos del backend afectados

| Archivo | Requerimientos |
|---|---|
| `src/models/giveawayModel.js` | R-1 (`reconcileSubmission`), R-4 (nuevo), R-5 (`getRecentActivity`), R-6 (`getStatsPerForm`), R-7 (`getUserReferralDetail`), R-8 (`getOverviewStats`) |
| `src/controllers/giveawayController.js` | R-2 (`buildReferralUrl`, `getMyReferralProfile`, `getReferralQR`), R-3, R-4, R-5, R-6, R-7, R-8 |
| `src/routes/giveawayRoutes.js` | R-4, R-5, R-6 (rutas nuevas) |
| `src/routes/userRoutes.js` | R-2, R-3 (`/me/referral-profile`, `/me/referral-qr`) |

Middlewares a reutilizar: `verifyToken`, `adminOrOp` (métricas), `adminOnly` (perfil de referente). `/me/*` queda con `verifyToken` a secas, como hoy.

---

## Precaución de despliegue

El repo `backend-aquanova` está en rama **`produccion`**. R-1 modifica lógica transaccional de otorgamiento de puntos y R-2 cambia la forma de un link ya distribuido. Conviene trabajarlos en una rama aparte y validarlos con datos reales antes de mezclar.
