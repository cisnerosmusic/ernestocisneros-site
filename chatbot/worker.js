// =============================================================================
// Ernesto Cisneros Chatbot - Cloudflare Worker v2
// =============================================================================
// Arquitectura:
// - System prompt minimo cacheable (~750 tokens)
// - Conocimiento en KV namespace CHATBOT_KNOWLEDGE como JSONs por dominio
// - Tool calling: search_knowledge / get_detail / list_works
// - Analytics y rate limiting heredados del v1 (CHATBOT_DATA)
// - Prompt caching activado en system + tools
//
// Bindings requeridos:
//   - env.ANTHROPIC_API_KEY     (secret)
//   - env.CHATBOT_DATA          (KV: chatbot-analytics, id c07f8708d1494801860d28afa8d6c230)
//   - env.CHATBOT_KNOWLEDGE     (KV: chatbot-knowledge,  id 94ce1518f75b440d86eb56ab2610f318)
// =============================================================================

// ─── System prompt minimo (estatico, cacheable) ───
const SYSTEM_PROMPT = `Eres el asistente virtual de Ernesto Cisneros Cino en su sitio web ernestocisneros.art. Conversacional, calido, preciso, breve.

IDENTIDAD CENTRAL (REGLA MAESTRA, no negociable):
Ernesto Cisneros Cino ES un MUSICO CUBANO. Compositor y pianista que ha dedicado la mayor parte de su vida a la creacion musical, principalmente para cine, television, teatro, ballet, radio, internet. Esa es su profesion, su identidad, su trayecto. Cuando alguien pregunta "quien es Ernesto?" o "que es Ernesto?", la respuesta SIEMPRE empieza con "es un musico cubano" o "es un compositor cubano" (nunca "compositor, autor y filosofo" ni similar).

Ernesto tambien escribe libros, hace arte visual, codea, hace fotografia, edita video, calcula, reflexiona profundamente sobre filosofia, etica, epistemologia, fisica, cosmologia, matematicas, ciencia, tecnologia, politica, gobernanza. Pero estas son ACTIVIDADES COLATERALES, intereses interdisciplinarios, exploraciones intelectuales y artisticas. NO son identidades paralelas.

Hacer matematica avanzada NO lo hace matematico. Escribir sobre filosofia NO lo hace filosofo. Codear NO lo hace desarrollador. Escribir libros sobre fisica NO lo hace fisico. Es un musico con curiosidad amplia que explora muchos campos con seriedad, pero su identidad central, lo que define quien es, es la musica.

PROHIBIDO etiquetarlo como "filosofo", "desarrollador", "fisico", "matematico", "cientifico", "escritor profesional" o cualquier titulo profesional que no sea musico/compositor/pianista. Cuando menciones sus otras actividades, hazlo siempre como practicas o intereses, no como profesiones: "tambien explora la filosofia en sus ensayos", "tambien escribe libros", "tambien programa", "tambien ha investigado en cosmologia", etc. El verbo correcto es "explorar", "tambien", "ademas de la musica" - nunca "es".

EJEMPLO CORRECTO de respuesta a "quien es Ernesto Cisneros?":
"Es un musico cubano radicado en Miami, compositor para cine, TV, teatro y ballet, con mas de 800 obras registradas. Ademas de la musica, explora la escritura, el arte digital y el pensamiento filosofico, pero la musica es lo central. Mas en https://ernestocisneros.art/biography ."

EJEMPLO INCORRECTO (NUNCA hagas esto):
"Es compositor, autor y filosofo cubano radicado en Miami."

ESTILO (CRITICO):
- BREVEDAD ABSOLUTA: maximo 60 palabras por respuesta. Si necesitas decir mas, ofreces seguir: "puedo expandir si quieres". Esta regla solo se rompe si el visitante pide explicitamente "cuentame en detalle", "explicame todo", "dame el contexto completo".
- Conversacional, como un amigo informado, no un folleto.
- FORMATO: texto plano, prosa continua. PROHIBIDO usar markdown en CUALQUIER forma:
  * Nada de **negritas** ni *cursivas*
  * Nada de listas. Ni numeradas (1., 2., 3.) ni con vinetas (-, *, •). Si tienes que listar varias cosas, las escribes como prosa: "tres opciones: A, B y C" o "primero esto, despues lo otro".
  * Nada de # headings ni **Headings:**.
  * Nada de listas inline tipo "Tres cosas: 1. Foo 2. Bar 3. Baz". Esto cuenta como lista igual que si tuviera saltos de linea.
- URLS: despues de cualquier URL, SIEMPRE pones un espacio o punto. NUNCA pegas un caracter directo a la URL como "books?Cual" o "books-es donde". Ejemplo correcto: "esta en https://ernestocisneros.art/books si quieres ver mas." Incorrecto: "esta en https://ernestocisneros.art/books?si" (porque el frontend convierte la URL en link y arrastra el "?si" al href).
- Responde en el mismo idioma del visitante (EN, ES, FR, IT, JA, KO, RU, otro).
- NUNCA uses guion largo (em dash). Usa coma, punto, punto y coma.
- NUNCA inventes datos. Si no estas seguro, dilo y sugiere contactar a Ernesto en /contact.
- Off-topic con humor cubano calido y limpio. Nunca robotico ni vulgar. Sin malas palabras en ningun idioma.

ESTRATEGIA CONVERSACIONAL:
Tu meta no es solo responder, es guiar a cada visitante hacia una experiencia positiva. La musica es el puente universal: hecha para que cualquiera se sienta mejor. Tipos de visitante:
- CURIOSO: guia con profundidad, genera trafico al sitio.
- BROMA/PERDER TIEMPO: humor que despierta curiosidad.
- BELIGERANTE: no peleas, ni reflejas agresion. Llevas la conversacion al respeto por la obra (800+ composiciones, libros publicados, colaboraciones internacionales, premios). La obra habla.
- RESISTENTE/TENSO: el recurso final es la musica. Direccionalo a https://ernestocisneros.art/music o https://impulses.online/listen.html con: "Pruebalo. Solo cierra los ojos y dejate llevar. Al final, vas a agradecer el viaje."

(Para preguntas politicas sobre Cuba o comunismo, ver la regla dedicada mas abajo.)

CTA PRIORITARIO: enlazar siempre a la pagina relevante de ernestocisneros.art. Solo en colaboracion creativa, contratacion o consulta de servicios, dirige a /contact.

DOMINIOS CANONICOS (8 areas, identifica en silencio antes de responder):
1. musica composicion historica (cine/TV, 800+ obras)
2. musica instrumental (7 albumes: Atlas of Fragmented Light, Glacial Paths, Mare Incognitum, Nocturne of Glass Currents, Sandbank, Trash, Velvet Alloy)
3. arte digital y NFTs (Tezos, Ethereum, Bitcoin)
4. cosmologia y fisica (R = tau x Omega, Memoria Finita)
5. filosofia, etica, ensayos
6. musicoterapia / Impulses.art
7. servicios comerciales (UnlimitedWraps, Scudo Stone, web)
8. biografia general

REGLA DE ORO: identifica el dominio. Si es ambiguo entre dos, pregunta antes de responder.

POSTURA SOBRE CUBA Y COMUNISMO (regla critica para conversaciones tipicas en Miami):
Cuando alguien pregunta "le gusta el comunismo?", "es comunista?", "que piensa de Cuba?", "es de izquierda o de derecha?", aplica esta logica de escalacion:

- PRIMERA pregunta (puede ser retorica o sondeo): respuesta breve y honesta, sin entrar en debate. Algo como: "Ernesto salio de Cuba justamente por su desacuerdo con el regimen. Si quieres profundidad, lee su ensayo sobre el problema estructural del poder en https://ernestocisneros.art/ideas/cuba-riesgo-mecanismo ." Sin etiquetas ideologicas. No uses la palabra "comunista" para describirlo. Ernesto se opone al regimen, no se autoidentifica con etiquetas.

- SI INSISTEN o reformulan ("entonces es comunista?", "pero a favor o en contra?", "no me respondiste"): se acabo la ambiguedad. Declara DIRECTO Y LIMPIO usando este texto base:
  "Ernesto salio de Cuba precisamente porque no se sentia comodo con el gobierno cubano. Uno de sus objetivos en la vida es vivir en libertad, y eso no es posible bajo el gobierno actual de Cuba. Eso es lo concreto. Si quieres entender como ve estructuralmente el problema, mas alla de etiquetas comunismo-vs-capitalismo, esta el ensayo 'El riesgo de repetir el mecanismo' en https://ernestocisneros.art/ideas/cuba-riesgo-mecanismo ."
  Tono: firme, sereno, sin agresion. Sin debate. Es una declaracion, no una opinion en disputa.

- NO te dejes arrastrar a polemica. Si el usuario sigue presionando despues de la respuesta directa, cierra: "Esa es la postura. Mas alla de eso, te invito a leer los ensayos o a contactar directamente a Ernesto en /contact." Y vuelves al rol normal.

ATAQUE POLITICO (otros temas, no Cuba): aclara que toda postura tiene sesgo. No debates; redirige a los ensayos (Overton Window, Trap of Light).

DISAMBIGUACION CRITICA: NO confundir con Ernesto Cisneros (autor de Pura Belpre, escritor de literatura juvenil en California). Este es Ernesto Cisneros Cino, compositor cubano residente en Miami.

DONDE ESTA LA MUSICA (regla critica, no negociable):
La musica de Ernesto NO esta disponible en Spotify, Apple Music, YouTube Music, Tidal, Amazon Music, Deezer, SoundCloud comercial, ni ninguna plataforma tradicional de streaming. Esto es una decision deliberada de Ernesto. NUNCA sugieras buscar su musica en esas plataformas, ni siquiera como opcion adicional. La musica vive UNICAMENTE en:
- https://ernestocisneros.art/music (albumes completos, audio directo en el sitio)
- https://impulses.online/listen.html (coleccion terapeutica en loop)
- Obras NFT individuales en SolPersona, Objkt (Tezos), Bitcoin Ordinals, enlazadas desde https://ernestocisneros.art/nft
Si alguien pregunta donde escuchar, dirige siempre al sitio. Punto.

USO DE HERRAMIENTAS:
SIEMPRE usa las herramientas para datos especificos: titulos de obras, fechas, nombres de colaboradores, detalles de libros, biografia, tracks, anos. NO INVENTES. Si la herramienta no devuelve resultados, dilo y sugiere /contact.
- search_knowledge(query, domain?): busqueda por palabras clave en uno o todos los dominios.
- get_detail(domain, id): ficha completa de un item por id.
- list_works(domain): indice ligero de un dominio.
Dominios disponibles via tools: bio, current-projects, books, discography, timeline. Otros dominios (NFT, ideas, services, cuba-politica) se contestan con conocimiento general del sitio o redireccion a /contact.

REGLA CRITICA SOBRE FECHAS Y SECUENCIA TEMPORAL:
Si la pregunta contiene CUALQUIER componente temporal ("cuando", "en que ano", "a los X anos", "antes de", "despues de", "durante los anos 80/90/2000", "primer", "ultimo", "siguio", "termino", "salio de Cuba", "se mudo", "cambio"), USA SIEMPRE search_knowledge con domain="timeline" PRIMERO. Timeline es la fuente autoritativa para cronologia.

NUNCA inferir fechas a partir de la edad o cruzar datos de otros dominios. Si timeline no tiene la fecha exacta, dilo. PROHIBIDO inventar anos como "30 anos en 1991" o calcular fechas haciendo aritmetica con la fecha de nacimiento sin tener un evento explicito que respalde.

Distinciones criticas que el modelo NO debe confundir:
- Mexico 1999: salida TEMPORAL con Dayani Lozano, no salida definitiva de Cuba.
- Miami marzo 2024: salida DEFINITIVA de Cuba.
- 28 anos cuando fue a Mexico (1999), 52 anos cuando se mudo a Miami (2024).

REGLA CRITICA SOBRE BUSQUEDAS POR NOMBRE PROPIO:
SIEMPRE haces search_knowledge ANTES de responder cuando la pregunta menciona CUALQUIER nombre propio, sea de:
- Persona: "Arsenio", "Romero", "Edesio Alejandro", "Yadira Lopez", "Eddy Cardoza", etc.
- Instrumento, marca o modelo: "KRONOS", "Korg", "Yamaha", "M1", "TRITON", "Trinity", "Performa", "Roland", "Pro Tools", "Cubase", etc.
- Banda, proyecto o lugar: "Buena Fe", "Paisaje con Rio", "Impulses", "Kalamint", "Tezos", "Foundation", "El Rostro de los Dias", etc.
- Obra, libro, album o cancion: "Nada", "Suite Habana", "Glacial Paths", "Sombras Datos y Relampagos", "Librame del Quebranto", etc.
- Cualquier palabra escrita en MAYUSCULAS o con inicial mayuscula que parezca nombre propio.

Cuando la pregunta tiene la forma "sabes si conoce X?", "ha usado X?", "trabaja con X?", "sabe de X?", "que opina de X?", la respuesta NUNCA es "no tengo informacion" sin haber buscado antes. SIEMPRE haces search_knowledge(query=X, domain="all") PRIMERO. Solo despues de obtener cero resultados puedes decir que no aparece.

Ejemplos correctos:
- "sabes si conoce el KRONOS?" -> search_knowledge(query="KRONOS", domain="all")
- "ha usado Pro Tools?" -> search_knowledge(query="Pro Tools", domain="all")
- "que sabes de Foundation?" -> search_knowledge(query="Foundation", domain="all")
- "trabaja con Yamaha?" -> search_knowledge(query="Yamaha", domain="all")
- "conoce a Romero?" -> search_knowledge(query="Romero", domain="all")

NUNCA expandas la query a frases descriptivas. Usa el nombre tal cual aparece. Si la pregunta es "que Korg usa?", la query es "Korg" (no "Korg instrumento teclado").

REGLA DE SESGO POSITIVO HACIA LA BUSQUEDA:
Ante la duda, SIEMPRE busca. Es mejor llamar a search_knowledge sin necesidad que dejar de buscar cuando la informacion esta en la base de datos. El costo de una busqueda extra es minimo; el costo de decir falsamente "no tengo info" cuando si la hay es alto.

REGLA CRITICA SOBRE BUSQUEDAS POR FECHAS/PERSONAS (resumen): cualquier pregunta que mencione un nombre propio O un componente temporal -> search_knowledge antes de responder. NO responder de memoria.

NAVEGACION DEL SITIO:
Home: https://ernestocisneros.art/
Biography: /biography | Music: /music | Books: /books | NFT & Web3: /nft | Ideas: /ideas | Impulses: /impulses-art | Contact: /contact
Albumes: /music/atlas-of-fragmented-light, /music/glacial-paths, /music/mare-incognitum, /music/nocturne-of-glass-currents, /music/sandbank, /music/trash, /music/velvet-alloy, /music/other-works
Guias NFT: /guide-backup-nft-en, /guide-wallet-en, /guide-smart-contracts-en, /guide-where-your-art-lives-en
Ensayos: /ideas/cuba-riesgo-mecanismo (ES/EN), /ideas/invisible-power-algorithms (EN), /es/ideas/poder-invisible-algoritmos (ES)
Privacidad: /privacy-policy/
Idiomas: prefijos /es/, /fr/, /it/, /ja/, /ko/, /ru/

CONTACTO: https://ernestocisneros.art/contact (negocio, colaboraciones, servicios, citas terapia musical).

EJEMPLOS DE COMO RESPONDER (estudia estos; aplican SIEMPRE):

Pregunta: "Cuantos libros ha publicado?"
INCORRECTO (lista inline, demasiado largo, em dashes):
"Ernesto ha publicado 4 libros: 1. Sombras—novela hibrida 2. La Sospecha—ficcion especulativa 3. Huella—historia del conocimiento 4. La Necesidad de Creer—antropologia. Los detalles en https://ernestocisneros.art/books"
CORRECTO (prosa breve, sin numeros, sin em dashes, URL con espacio antes de la siguiente palabra):
"Cuatro libros. Dos en Amazon (Sombras, Datos y Relampagos; La Sospecha Razonable) y dos gratis en Zenodo (Huella, La Necesidad de Creer). Ve detalles en https://ernestocisneros.art/books si quieres explorarlos."

Pregunta: "Cuentame de Paisaje con Rio"
INCORRECTO (mini-articulo de 6 secciones, headers, demasiado largo):
"Paisaje con Rio fue la banda... El origen: Fundada en los anos 80... Como entro Ernesto: a los 16 anos... El viaje epico: 30 km diarios... El fenomeno: hits en radio... El final: 1996, gira, exilio."
CORRECTO (parrafo corto, prosa, ofrece expandir):
"Paisaje con Rio fue la banda que defino a Ernesto musicalmente. Entro a los 16 anos, aprendio el repertorio escuchando desde la habitacion contigua de la Casa de Cultura, y caminaba 30 km diarios para ensayar. Termino en 1996. Si quieres, te cuento alguna parte en detalle, o lees todo en https://ernestocisneros.art/biography ."

Pregunta: "De que trata La Necesidad de Creer?"
CORRECTO (3 oraciones, una URL, sin listas):
"Examina por que los humanos necesitamos creer, escrito por un ateo que aprendio a escuchar sin condescendencia. La pregunta central no es si Dios existe, sino que hace una especie consciente de su mortalidad para no quedar paralizada. Gratis en Zenodo, mas detalle en https://ernestocisneros.art/books ."

Patron a internalizar: prosa continua, oraciones cortas, una URL si aplica, ofrecer expandir si el tema es grande. NUNCA listas.`;

// ─── Definicion de tools ───
const TOOLS = [
  {
    name: 'search_knowledge',
    description: 'Busca por palabras clave en la base de conocimiento de Ernesto. Devuelve fragmentos relevantes. Usa esta herramienta para preguntas especificas sobre obras, fechas, colaboradores, libros, albumes, biografia.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Palabras clave a buscar (1-5 palabras, en el idioma original del contenido).',
        },
        domain: {
          type: 'string',
          enum: ['bio', 'current-projects', 'books', 'discography', 'timeline', 'all'],
          description: 'Dominio a buscar. Usa "timeline" para preguntas con fechas o secuencia temporal. Usa "all" si no estas seguro o si la pregunta cruza dominios.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_detail',
    description: 'Trae la ficha completa de un item especifico por dominio + id. Usa esto despues de un list_works o search_knowledge para obtener todos los detalles de un libro, album o proyecto especifico.',
    input_schema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          enum: ['bio', 'current-projects', 'books', 'discography', 'timeline'],
          description: 'Dominio donde vive el item.',
        },
        id: {
          type: 'string',
          description: 'Identificador del item (ej: "huella", "mare_incognitum", "paisaje_con_rio", "miami_relocation_2024").',
        },
      },
      required: ['domain', 'id'],
    },
  },
  {
    name: 'list_works',
    description: 'Lista todos los items de un dominio (id, titulo, ano, tipo). Indice ligero para preguntas como "que albumes tiene Ernesto?" o "cuantos libros publico?".',
    input_schema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          enum: ['bio', 'current-projects', 'books', 'discography', 'timeline'],
          description: 'Dominio a listar.',
        },
      },
      required: ['domain'],
    },
  },
];

// ─── CORS ───
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ─── Rate limiting ───
const RATE_LIMIT = 20;
const RATE_WINDOW = 60;

// ─── Anti-abuso: limites de tamano y presupuesto diario ───
const MAX_MESSAGE_CHARS = 2000;        // Maximo por mensaje del usuario
const MAX_HISTORY_CHARS = 8000;        // Maximo total acumulado en los ultimos 10 mensajes
const DAILY_REQUEST_BUDGET = 500;      // Techo absoluto de requests aceptadas por dia (UTC)

// =============================================================================
// Helpers de busqueda en JSON
// =============================================================================

// Normaliza string: minusculas + quita acentos/diacriticos.
// Hace que "Río" y "Rio" matcheen, "café" y "cafe", etc.
function normalize(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function searchInJSON(obj, query, path = '', results = [], maxResults = 8, contextObj = null) {
  if (results.length >= maxResults) return results;
  const q = normalize(query);

  if (typeof obj === 'string') {
    if (normalize(obj).includes(q)) {
      // Si el string matched vive dentro de un objeto estructurado pequeno
      // (ej: { name: "Edesio Alejandro", role: "..." }), devolver el objeto
      // padre completo da mucho mas contexto que solo el string aislado.
      // Heuristica: si el objeto padre stringificado cabe en ~800 chars, usarlo.
      let snippet;
      if (contextObj && typeof contextObj === 'object' && !Array.isArray(contextObj)) {
        const contextStr = JSON.stringify(contextObj);
        if (contextStr.length <= 800) {
          snippet = contextStr;
        } else {
          snippet = obj.length > 350 ? obj.substring(0, 350) + '...' : obj;
        }
      } else {
        snippet = obj.length > 350 ? obj.substring(0, 350) + '...' : obj;
      }
      results.push({ path, snippet });
    }
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length && results.length < maxResults; i++) {
      // En arrays, cada item es independiente. No heredar contexto.
      searchInJSON(obj[i], query, `${path}[${i}]`, results, maxResults, null);
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (results.length >= maxResults) break;
      const newPath = path ? `${path}.${key}` : key;
      if (normalize(key).includes(q) && results.length < maxResults) {
        const snippet = typeof value === 'object'
          ? JSON.stringify(value).substring(0, 500)
          : String(value).substring(0, 500);
        results.push({ path: newPath, snippet, matched_on: 'key' });
      }
      // Pasar el objeto actual como contexto: si su valor es un string que
      // matchea, sabremos que vive dentro de este objeto y podremos enriquecer
      // el snippet con todos los campos hermanos.
      searchInJSON(value, query, newPath, results, maxResults, obj);
    }
  }
  return results;
}

// Busqueda multi-palabra: si la query original no devuelve resultados,
// intenta con cada palabra individual y combina (rank por cuantas palabras matchean)
function smartSearch(obj, query, maxResults = 8) {
  // Intento 1: match exacto de la query completa
  const exact = searchInJSON(obj, query, '', [], maxResults);
  if (exact.length > 0) return exact;

  // Intento 2: separar en palabras, buscar cada una, combinar
  // Filtrar palabras "stop" cortas o muy comunes
  const stopwords = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'un', 'una', 'y', 'o', 'a', 'al', 'en', 'es', 'que', 'su', 'sus', 'mi', 'tu', 'fue', 'son', 'the', 'and', 'or', 'of', 'is', 'a']);
  const words = query.split(/\s+/).filter((w) => w.length >= 3 && !stopwords.has(w.toLowerCase()));
  if (words.length === 0) return [];

  // Buscar cada palabra y aglomerar por path
  const pathScores = new Map(); // path -> { count, snippet, paths matched }
  for (const w of words) {
    const r = searchInJSON(obj, w, '', [], maxResults * 2);
    for (const match of r) {
      const existing = pathScores.get(match.path);
      if (existing) {
        existing.count++;
        existing.matched_words.add(w);
      } else {
        pathScores.set(match.path, {
          ...match,
          count: 1,
          matched_words: new Set([w]),
        });
      }
    }
  }

  // Ranking: paths con mas palabras match primero
  const ranked = Array.from(pathScores.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxResults)
    .map((r) => ({
      path: r.path,
      snippet: r.snippet,
      matched_on: r.matched_on,
      matched_words: Array.from(r.matched_words).join(','),
    }));

  return ranked;
}

function findById(obj, targetId) {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const nested = findById(item, targetId);
      if (nested) return nested;
    }
  } else if (typeof obj === 'object' && obj !== null) {
    if (obj.id === targetId) return obj;
    for (const value of Object.values(obj)) {
      const nested = findById(value, targetId);
      if (nested) return nested;
    }
  }
  return null;
}

function extractIndex(obj, items = [], seen = new Set()) {
  if (typeof obj !== 'object' || obj === null) return items;
  if (obj.id && (obj.title || obj.name) && !seen.has(obj.id)) {
    const entry = { id: obj.id, title: obj.title || obj.name };
    if (obj.year || obj.year_range) entry.year = obj.year || obj.year_range;
    if (obj.type) entry.type = obj.type;
    if (obj.language) entry.language = obj.language;
    items.push(entry);
    seen.add(obj.id);
  }
  if (Array.isArray(obj)) {
    for (const item of obj) extractIndex(item, items, seen);
  } else {
    for (const value of Object.values(obj)) extractIndex(value, items, seen);
  }
  return items;
}

// =============================================================================
// Tool handlers
// =============================================================================

async function tool_search_knowledge(env, { query, domain }) {
  if (!query || query.trim().length === 0) {
    return { error: 'query is empty' };
  }
  const allDomains = ['bio', 'current-projects', 'books', 'discography', 'timeline'];
  const targetDomains = (!domain || domain === 'all') ? allDomains : [domain];

  const allResults = [];
  for (const d of targetDomains) {
    try {
      const json = await env.CHATBOT_KNOWLEDGE.get(`${d}.json`, 'json');
      if (!json) continue;
      const results = smartSearch(json, query.trim(), 5);
      for (const r of results) {
        allResults.push({ domain: d, ...r });
      }
    } catch (e) {
      // ignore individual domain errors
    }
  }

  if (allResults.length === 0) {
    return {
      found: false,
      query,
      message: `Sin resultados para "${query}" en: ${targetDomains.join(', ')}`,
    };
  }
  return { found: true, query, count: allResults.length, results: allResults.slice(0, 8) };
}

async function tool_get_detail(env, { domain, id }) {
  try {
    const json = await env.CHATBOT_KNOWLEDGE.get(`${domain}.json`, 'json');
    if (!json) return { error: `dominio "${domain}" no encontrado en KV` };
    const found = findById(json, id);
    if (!found) return { error: `no hay item con id "${id}" en ${domain}` };
    return { domain, id, data: found };
  } catch (e) {
    return { error: `error leyendo ${domain}: ${e.message}` };
  }
}

async function tool_list_works(env, { domain }) {
  try {
    const json = await env.CHATBOT_KNOWLEDGE.get(`${domain}.json`, 'json');
    if (!json) return { error: `dominio "${domain}" no encontrado en KV` };
    const items = extractIndex(json, []);
    return {
      domain,
      top_level_keys: Object.keys(json),
      items_count: items.length,
      items,
    };
  } catch (e) {
    return { error: `error leyendo ${domain}: ${e.message}` };
  }
}

// =============================================================================
// Red de seguridad: limpiar markdown del output antes de devolverlo.
// El system prompt le pide a Claude que NO use markdown, pero Haiku tiende
// a usarlo igual. Esto garantiza que el frontend reciba texto plano siempre.
// =============================================================================

function stripMarkdown(text) {
  if (!text) return text;
  let out = text;

  // Markdown links: [text](url) -> url (la URL es lo importante)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => u);

  // Negritas y cursivas (orden importa: primero ** que *, primero __ que _)
  out = out.replace(/\*\*([^*\n]+)\*\*/g, '$1');
  out = out.replace(/__([^_\n]+)__/g, '$1');
  out = out.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1');
  out = out.replace(/(?<!_)_([^_\n]+)_(?!_)/g, '$1');

  // Headings: # Title, ## Title, etc.
  out = out.replace(/^#{1,6}\s+/gm, '');

  // Listas numeradas al inicio de linea: "1. ", "2. ", etc.
  out = out.replace(/^[ \t]*\d+\.\s+/gm, '');

  // Listas numeradas inline: "Texto: 1. Foo 2. Bar 3. Baz"
  // Si hay 2+ marcadores [1-9].\s en el texto, asumimos que es lista y limpiamos.
  // Solo digitos 1-9 para no confundir con anos (1985.) o decimales (1.5).
  const inlineMarkers = out.match(/(?:^|\s|:|;|,|\.)\s*[1-9]\.\s+\S/g);
  if (inlineMarkers && inlineMarkers.length >= 2) {
    out = out.replace(/(:|;|,|\.)\s*[1-9]\.\s+/g, '$1 ');
    out = out.replace(/(\s)[1-9]\.\s+(?=\S)/g, '$1');
  }

  // Vinetas al inicio de linea: "- ", "* ", "• "
  out = out.replace(/^[ \t]*[-*•]\s+/gm, '');

  // Codigo inline: `text` -> text
  out = out.replace(/`([^`\n]+)`/g, '$1');

  // Blockquotes: "> text"
  out = out.replace(/^>\s+/gm, '');

  // Em dash: reemplazar por coma+espacio (incluyendo si esta pegado a palabras)
  // Captura tambien en-dash como precaucion
  out = out.replace(/\s*[—–]\s*/g, ', ');

  // URLs pegadas a puntuacion: insertar espacio entre URL y caracteres ¿¡
  // (los frontends que linkifican URLs arrastran estos chars al href, rompiendo el link)
  out = out.replace(/(https?:\/\/[^\s]*?)([¿¡])/g, '$1 $2');

  // Limpiar espacios multiples y lineas vacias
  out = out.replace(/[ \t]{2,}/g, ' ');
  out = out.replace(/\n{3,}/g, '\n\n');

  return out.trim();
}

// =============================================================================
// Llamada a Anthropic con prompt caching en system + tools
// =============================================================================

async function callAnthropic(env, messages) {
  // cache_control en DOS sitios para garantizar cacheo:
  // 1. En el system block (cachea el system prompt)
  // 2. En el último tool (cachea tools después del system)
  // Anthropic permite hasta 4 breakpoints. Usar 2 es defensive coding:
  // si uno no se aplica por alguna razón del modelo, el otro funciona.
  const cachedTools = TOOLS.map((t, i) =>
    i === TOOLS.length - 1
      ? { ...t, cache_control: { type: 'ephemeral' } }
      : t
  );

  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: [
      { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
    ],
    tools: cachedTools,
    messages,
  });

  // Retry exponencial para errores transitorios (429, 500-504).
  // Errores client (4xx excepto 429) NO se reintentan: indican bug, no congestion.
  const RETRY_DELAYS_MS = [500, 1500]; // 2 retries: a los 500ms y 1500ms
  let lastError;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body,
      });

      if (response.ok) {
        return await response.json();
      }

      const errorText = await response.text();
      const isTransient = response.status === 429 || (response.status >= 500 && response.status < 600);

      if (!isTransient || attempt === RETRY_DELAYS_MS.length) {
        // No es transitorio, o ya se agotaron los retries
        throw new Error(`Anthropic API ${response.status}: ${errorText.substring(0, 300)}`);
      }

      lastError = new Error(`Anthropic API ${response.status} (transient, retry ${attempt + 1}): ${errorText.substring(0, 200)}`);
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
    } catch (e) {
      // Error de red (no respuesta HTTP). Tambien es transitorio en general.
      if (attempt === RETRY_DELAYS_MS.length) throw e;
      lastError = e;
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
    }
  }
  throw lastError || new Error('callAnthropic: failed after retries');
}

// =============================================================================
// Agent loop
// =============================================================================

async function runAgent(env, messages) {
  const apiMessages = [...messages];
  const MAX_ITERATIONS = 3;
  let iterations = 0;
  let totalUsage = {
    input_tokens: 0,
    output_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
  };
  const toolCalls = [];

  while (iterations < MAX_ITERATIONS) {
    const response = await callAnthropic(env, apiMessages);

    if (response.usage) {
      totalUsage.input_tokens += response.usage.input_tokens || 0;
      totalUsage.output_tokens += response.usage.output_tokens || 0;
      totalUsage.cache_read_input_tokens += response.usage.cache_read_input_tokens || 0;
      totalUsage.cache_creation_input_tokens += response.usage.cache_creation_input_tokens || 0;
    }

    if (response.stop_reason === 'tool_use') {
      apiMessages.push({ role: 'assistant', content: response.content });

      const toolResults = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          let result;
          try {
            if (block.name === 'search_knowledge') {
              result = await tool_search_knowledge(env, block.input);
            } else if (block.name === 'get_detail') {
              result = await tool_get_detail(env, block.input);
            } else if (block.name === 'list_works') {
              result = await tool_list_works(env, block.input);
            } else {
              result = { error: `tool desconocido: ${block.name}` };
            }
          } catch (e) {
            result = { error: e.message };
          }
          toolCalls.push({ name: block.name, input: block.input });
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }
      }
      apiMessages.push({ role: 'user', content: toolResults });
      iterations++;
    } else {
      const textBlock = response.content.find((b) => b.type === 'text');
      const rawReply = textBlock ? textBlock.text : '';
      return {
        reply: stripMarkdown(rawReply),
        usage: totalUsage,
        iterations,
        tool_calls: toolCalls,
      };
    }
  }

  return {
    reply: 'Disculpa, me enrede buscando esa informacion. Puedes reformular la pregunta?',
    usage: totalUsage,
    iterations: MAX_ITERATIONS,
    tool_calls: toolCalls,
    truncated: true,
  };
}

// =============================================================================
// Analytics (heredado de v1)
// =============================================================================

function detectLanguage(text) {
  const t = text.toLowerCase();

  // Idiomas por scripts no-latinos: deteccion inmediata
  if (/[ぁ-ん]|[ァ-ヶ]|[一-龠]/.test(t)) return 'ja';
  if (/[가-힣]/.test(t)) return 'ko';
  if (/[а-яА-ЯёЁ]{3,}/.test(t)) return 'ru';
  if (/[一-鿿]/.test(t)) return 'ja';

  // Caracteres distintivos del espanol (acentos, ñ, ¿, ¡)
  const spanishChars = (t.match(/[áéíóúñ¿¡üÁÉÍÓÚÑÜ]/g) || []).length;

  // Scoring por palabras frecuentes (token boundaries con espacios o inicio/fin)
  // Construimos regex con \b para evitar falsos positivos
  const score = { es: 0, en: 0, fr: 0, it: 0 };

  // Espanol: palabras y patrones muy distintivos
  if (/\b(que|qué|cómo|como|dónde|donde|cuándo|cuando|quién|quien|cuál|cual|por qué|porque|hola|gracias|por favor|tú|usted|ustedes|nosotros|tengo|tiene|está|estoy|soy|eres|fue|fui|hace|hacer|hizo|tu|su|sus|mi|mis|le|les|te|se|esto|eso|esa|este|esta|aquí|aqui|allí|alli|también|tambien|pero|aunque|si|sí|cosa|todo|nada|alguien|algo|nunca|siempre|hay|hubo|son|fueron|cubano|cubana|música|musica|libro|escuchar|comer|cocinar|malanga|bulo)\b/.test(t)) score.es += 3;
  if (spanishChars > 0) score.es += spanishChars * 2;
  if (/\b(el|la|los|las|un|una|y|o|de|en|con|para|por|del|al)\b/.test(t)) score.es += 1;

  // Ingles
  if (/\b(the|and|or|of|in|to|for|with|is|are|was|were|have|has|had|what|where|when|who|which|how|why|do|does|did|can|could|would|should|will|tell|me|about|me|i|you|your|my|his|her|its|their|this|that|these|those|some|any|all|here|there|now|then|but|if|because|though|hello|hi|thanks|please)\b/.test(t)) score.en += 2;

  // Frances
  if (/\b(le|la|les|un|une|des|et|ou|de|du|en|à|au|aux|avec|pour|par|sur|que|qui|quoi|où|quand|comment|pourquoi|c'est|je|tu|il|elle|nous|vous|ils|elles|mon|ma|mes|ton|ta|tes|son|sa|ses|bonjour|merci|s'il|vous|plaît)\b/.test(t)) score.fr += 3;
  if (/[àâçéèêëîïôûùüÿœæ]/.test(t)) score.fr += 2;

  // Italiano
  if (/\b(il|la|lo|gli|le|un|una|e|o|di|in|con|per|da|che|chi|cosa|dove|quando|come|perché|sono|è|ho|hai|ha|abbiamo|avete|hanno|mio|mia|miei|mie|tuo|tua|tuoi|tue|suo|sua|suoi|sue|ciao|grazie|prego|buongiorno|vorrei|posso)\b/.test(t)) score.it += 3;

  // Si nada clarea, default ingles
  const max = Math.max(score.es, score.en, score.fr, score.it);
  if (max === 0) return 'en';
  if (score.es === max) return 'es';
  if (score.fr === max) return 'fr';
  if (score.it === max) return 'it';
  return 'en';
}

function detectTopic(text) {
  const t = text.toLowerCase();
  if (/music|músic|album|song|piano|compos|sound|listen|escuch|oír|nocturne|velvet.alloy|glacial|mare.incog/.test(t)) return 'music';
  if (/nft|web3|blockchain|crypto|token|mint|collect|tezos|ethereum/.test(t)) return 'nft';
  if (/book|libro|sombra|sospecha|huella|necesidad.*creer|amazon|read|leer/.test(t)) return 'books';
  if (/therap|impulse|healing|salud|bienestar|piano.*therap|session/.test(t)) return 'impulses';
  if (/film|movie|suite habana|tv|television|cine|pelicula|soundtrack/.test(t)) return 'film';
  if (/idea|philos|cosmol|physics|tau|resilience|dao|govern|essay|algorithm|algoritmo/.test(t)) return 'ideas';
  if (/buena fe|concert|band|grupo|gira/.test(t)) return 'buena-fe';
  if (/service|servicio|web design|seo|consult|hire|contrat/.test(t)) return 'services';
  if (/contact|email|correo|colabor|collabor/.test(t)) return 'contact';
  if (/cuba|miami|exile|exilio|politic/.test(t)) return 'cuba-exile';
  if (/paisaje.*rio|romero/.test(t)) return 'paisaje-con-rio';
  if (/religion|believe|creer|faith|ateis/.test(t)) return 'belief';
  return 'general';
}

const REPORT_KEY = 'ec-analytics-2026';

async function generateReport(env, days = 7) {
  if (!env.CHATBOT_DATA) return { error: 'KV not bound' };
  const now = new Date();
  const topics = {};
  const langs = {};
  let totalMessages = 0;
  const dailyTotals = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const dayTotal = parseInt((await env.CHATBOT_DATA.get(`count:total:${date}`)) || '0');
    totalMessages += dayTotal;
    dailyTotals.push({ date, count: dayTotal });

    const topicNames = ['music', 'nft', 'books', 'impulses', 'film', 'ideas', 'buena-fe', 'services', 'contact', 'cuba-exile', 'paisaje-con-rio', 'belief', 'general'];
    for (const t of topicNames) {
      const count = parseInt((await env.CHATBOT_DATA.get(`count:topic:${date}:${t}`)) || '0');
      if (count > 0) topics[t] = (topics[t] || 0) + count;
    }
    const langNames = ['en', 'es', 'fr', 'it', 'ja', 'ko', 'ru'];
    for (const l of langNames) {
      const count = parseInt((await env.CHATBOT_DATA.get(`count:lang:${date}:${l}`)) || '0');
      if (count > 0) langs[l] = (langs[l] || 0) + count;
    }
  }

  // Logs más recientes: traer N por timestamp descendente
  // KV.list devuelve keys en orden alfabético ascendente. Como las keys son
  // log:${ISO_timestamp}:${rand}, alfabético = cronológico ascendente. Para
  // sacar los MÁS RECIENTES, listamos TODAS las keys (cheap) y ordenamos.
  // Solo hacemos GET (caro) de las top-N que devolveremos.
  const recentLimit = 100; // default; puede ampliarse vía query param si hace falta
  const allKeys = [];
  let cursor;
  const MAX_LIST_PAGES = 10; // tope de seguridad: 10 * 1000 = 10000 keys
  let pages = 0;
  while (pages < MAX_LIST_PAGES) {
    const opts = { prefix: 'log:', limit: 1000 };
    if (cursor) opts.cursor = cursor;
    const result = await env.CHATBOT_DATA.list(opts);
    for (const k of result.keys) allKeys.push(k.name);
    if (result.list_complete || !result.cursor) break;
    cursor = result.cursor;
    pages++;
  }

  // Sort descendente: los más recientes primero (alfabético inverso del key)
  allKeys.sort((a, b) => b.localeCompare(a));
  const topKeys = allKeys.slice(0, recentLimit);

  // GET en paralelo (mucho más rápido que secuencial)
  const fetched = await Promise.all(
    topKeys.map((k) => env.CHATBOT_DATA.get(k).catch(() => null))
  );
  const recentQuestions = [];
  for (const val of fetched) {
    if (!val) continue;
    try { recentQuestions.push(JSON.parse(val)); } catch (e) {}
  }

  // Re-sort por timestamp dentro del payload (más confiable que el key)
  recentQuestions.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

  // Agregados de uso de herramientas y tokens (basados en logs disponibles)
  const toolUsage = {};
  let totalCacheHits = 0;
  let totalCacheCreations = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let logsWithMeta = 0;
  const pageBreakdown = {};
  const noResultsCount = recentQuestions.filter((q) =>
    typeof q.question === 'string' &&
    /no encuentro|no tengo|no hay informaci|sin resultados|cannot find|no info|sorry/i.test(q.botReply || '')
  ).length;

  for (const q of recentQuestions) {
    if (q.page) pageBreakdown[q.page] = (pageBreakdown[q.page] || 0) + 1;
    if (q.v2_meta) {
      logsWithMeta++;
      totalCacheHits += q.v2_meta.cache_read || 0;
      totalCacheCreations += q.v2_meta.cache_creation || 0;
      totalInputTokens += q.v2_meta.input_tokens || 0;
      totalOutputTokens += q.v2_meta.output_tokens || 0;
      if (Array.isArray(q.v2_meta.tool_calls)) {
        for (const t of q.v2_meta.tool_calls) {
          toolUsage[t] = (toolUsage[t] || 0) + 1;
        }
      }
    }
  }

  // Costo estimado en USD (Haiku 4.5: input ~$1/M, output ~$5/M, cache read ~$0.10/M)
  const estimatedCost =
    (totalInputTokens * 1.0 / 1_000_000) +
    (totalOutputTokens * 5.0 / 1_000_000) +
    (totalCacheHits * 0.10 / 1_000_000) +
    (totalCacheCreations * 1.25 / 1_000_000);

  return {
    period: `Last ${days} days`,
    version: 'v2',
    totalMessages,
    dailyTotals: dailyTotals.reverse(),
    topicBreakdown: Object.entries(topics).sort((a, b) => b[1] - a[1]),
    languageBreakdown: Object.entries(langs).sort((a, b) => b[1] - a[1]),
    pageBreakdown: Object.entries(pageBreakdown).sort((a, b) => b[1] - a[1]),
    toolUsage: Object.entries(toolUsage).sort((a, b) => b[1] - a[1]),
    tokens: {
      input: totalInputTokens,
      output: totalOutputTokens,
      cache_read: totalCacheHits,
      cache_creation: totalCacheCreations,
      cache_hit_ratio: totalInputTokens > 0
        ? (totalCacheHits / (totalInputTokens + totalCacheHits)).toFixed(3)
        : '0',
      estimated_cost_usd: estimatedCost.toFixed(4),
      logs_with_meta: logsWithMeta,
    },
    recentQuestions,
    generatedAt: now.toISOString(),
  };
}

// =============================================================================
// Worker entrypoint
// =============================================================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check + cache priming
    if (request.method === 'GET' && url.pathname === '/health') {
      const checks = {
        version: 'v2',
        timestamp: new Date().toISOString(),
        knowledge_kv: !!env.CHATBOT_KNOWLEDGE,
        analytics_kv: !!env.CHATBOT_DATA,
        api_key: !!env.ANTHROPIC_API_KEY,
        limits: {
          max_message_chars: MAX_MESSAGE_CHARS,
          max_history_chars: MAX_HISTORY_CHARS,
          daily_request_budget: DAILY_REQUEST_BUDGET,
        },
      };
      if (env.CHATBOT_KNOWLEDGE) {
        try {
          const list = await env.CHATBOT_KNOWLEDGE.list({ limit: 10 });
          checks.knowledge_keys = list.keys.map((k) => k.name);
        } catch (e) {
          checks.knowledge_error = e.message;
        }
      }
      if (env.CHATBOT_DATA) {
        try {
          const today = new Date().toISOString().slice(0, 10);
          const used = parseInt((await env.CHATBOT_DATA.get(`budget:${today}`)) || '0');
          checks.budget_today = {
            date: today,
            used,
            remaining: Math.max(0, DAILY_REQUEST_BUDGET - used),
            status: used >= DAILY_REQUEST_BUDGET ? 'EXHAUSTED' : 'ok',
          };

          // Conteo real de log:* en KV (paginar hasta agotar, máx 5 páginas)
          const logsByDate = {};
          let totalLogsInKV = 0;
          let cursor;
          for (let i = 0; i < 5; i++) {
            const opts = { prefix: 'log:', limit: 1000 };
            if (cursor) opts.cursor = cursor;
            const result = await env.CHATBOT_DATA.list(opts);
            for (const k of result.keys) {
              totalLogsInKV++;
              // key: log:2026-04-27T12:34:56.789Z:abc123
              const m = k.name.match(/^log:(\d{4}-\d{2}-\d{2})/);
              if (m) logsByDate[m[1]] = (logsByDate[m[1]] || 0) + 1;
            }
            if (result.list_complete || !result.cursor) break;
            cursor = result.cursor;
          }
          checks.logs_in_kv = {
            total: totalLogsInKV,
            by_date: Object.fromEntries(
              Object.entries(logsByDate).sort((a, b) => b[0].localeCompare(a[0]))
            ),
          };

          // Conteo de errores en KV (ultimos 7 dias)
          const errorsByDate = {};
          let totalErrors = 0;
          let errCursor;
          for (let i = 0; i < 3; i++) {
            const opts = { prefix: 'error:', limit: 1000 };
            if (errCursor) opts.cursor = errCursor;
            const result = await env.CHATBOT_DATA.list(opts);
            for (const k of result.keys) {
              totalErrors++;
              const m = k.name.match(/^error:(\d{4}-\d{2}-\d{2})/);
              if (m) errorsByDate[m[1]] = (errorsByDate[m[1]] || 0) + 1;
            }
            if (result.list_complete || !result.cursor) break;
            errCursor = result.cursor;
          }
          checks.errors_in_kv = {
            total: totalErrors,
            by_date: Object.fromEntries(
              Object.entries(errorsByDate).sort((a, b) => b[0].localeCompare(a[0]))
            ),
          };

          // Quick cache hit ratio basado en los 50 logs mas recientes
          // Util para verificar que el caching esta funcionando
          const cacheStats = { hits: 0, creations: 0, total_input: 0, sampled: 0 };
          const allKeys = [];
          let cKeyCursor;
          for (let i = 0; i < 2; i++) {
            const opts = { prefix: 'log:', limit: 1000 };
            if (cKeyCursor) opts.cursor = cKeyCursor;
            const result = await env.CHATBOT_DATA.list(opts);
            for (const k of result.keys) allKeys.push(k.name);
            if (result.list_complete || !result.cursor) break;
            cKeyCursor = result.cursor;
          }
          allKeys.sort((a, b) => b.localeCompare(a));
          const recentKeys = allKeys.slice(0, 50);
          const recentLogs = await Promise.all(
            recentKeys.map((k) => env.CHATBOT_DATA.get(k).catch(() => null))
          );
          for (const val of recentLogs) {
            if (!val) continue;
            try {
              const log = JSON.parse(val);
              if (log.v2_meta) {
                cacheStats.sampled++;
                cacheStats.hits += log.v2_meta.cache_read || 0;
                cacheStats.creations += log.v2_meta.cache_creation || 0;
                cacheStats.total_input += log.v2_meta.input_tokens || 0;
              }
            } catch (e) {}
          }
          const totalCacheable = cacheStats.hits + cacheStats.total_input;
          checks.cache_recent = {
            sampled_logs: cacheStats.sampled,
            hits: cacheStats.hits,
            creations: cacheStats.creations,
            input_tokens: cacheStats.total_input,
            hit_ratio: totalCacheable > 0
              ? (cacheStats.hits / totalCacheable * 100).toFixed(1) + '%'
              : 'n/a',
            status: cacheStats.creations > 0 || cacheStats.hits > 0 ? 'working' : 'NOT WORKING',
          };
        } catch (e) {
          checks.budget_error = e.message;
        }
      }
      return new Response(JSON.stringify(checks, null, 2), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Analytics report
    if (request.method === 'GET' && url.pathname === '/report') {
      if (url.searchParams.get('key') !== REPORT_KEY) {
        return new Response('Unauthorized', {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        });
      }
      const days = parseInt(url.searchParams.get('days') || '7');
      const report = await generateReport(env, Math.min(days, 90));
      return new Response(JSON.stringify(report, null, 2), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (env.CHATBOT_DATA) {
      const rateKey = `rate:${clientIP}`;
      const current = parseInt((await env.CHATBOT_DATA.get(rateKey)) || '0');
      if (current >= RATE_LIMIT) {
        return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      await env.CHATBOT_DATA.put(rateKey, String(current + 1), { expirationTtl: RATE_WINDOW });
    }

    try {
      const { messages } = await request.json();
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ─── Limite de tamano por mensaje del usuario ───
      const userMsgsRaw = messages.filter((m) => m.role === 'user');
      const lastUserMsg = userMsgsRaw[userMsgsRaw.length - 1];
      const lastContent = typeof lastUserMsg?.content === 'string' ? lastUserMsg.content : '';
      if (lastContent.length > MAX_MESSAGE_CHARS) {
        return new Response(JSON.stringify({
          reply: `Tu mensaje es muy largo (${lastContent.length} caracteres). Por favor, manten tus preguntas bajo ${MAX_MESSAGE_CHARS} caracteres. Si necesitas profundidad, contacta a Ernesto en https://ernestocisneros.art/contact.`
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Trim history
      const recentMessages = messages.slice(-10);

      // ─── Limite de tamano acumulado de la historia ───
      const totalHistoryChars = recentMessages.reduce((sum, m) =>
        sum + (typeof m.content === 'string' ? m.content.length : 0), 0);
      if (totalHistoryChars > MAX_HISTORY_CHARS) {
        return new Response(JSON.stringify({
          reply: 'La conversacion ha crecido mucho. Por favor, recarga la pagina para empezar de nuevo.'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ─── Circuit breaker: presupuesto diario absoluto ───
      const today = new Date().toISOString().slice(0, 10);
      const budgetKey = `budget:${today}`;
      let usedToday = 0;
      if (env.CHATBOT_DATA) {
        usedToday = parseInt((await env.CHATBOT_DATA.get(budgetKey)) || '0');
        if (usedToday >= DAILY_REQUEST_BUDGET) {
          return new Response(JSON.stringify({
            reply: 'El servicio esta temporalmente al maximo de capacidad por hoy. Vuelve manana, o si es urgente contacta a Ernesto directamente en https://ernestocisneros.art/contact.'
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        // Incrementar el contador ANTES de la llamada (conservador, evita races)
        // TTL = 86400 segundos = 24h. El contador se autoresetea cada dia.
        await env.CHATBOT_DATA.put(budgetKey, String(usedToday + 1), { expirationTtl: 86400 });
      }

      // Run agent
      const agentResult = await runAgent(env, recentMessages);

      // Analytics (non-blocking)
      if (env.CHATBOT_DATA) {
        ctx.waitUntil((async () => {
          try {
            const userMsgs = messages.filter((m) => m.role === 'user');
            if (userMsgs.length === 0) return;

            const timestamp = new Date().toISOString();
            const date = timestamp.slice(0, 10);
            const referer = request.headers.get('Referer') || '';
            const page = referer.replace('https://ernestocisneros.art', '').split('?')[0] || '/';
            const allQuestions = userMsgs.map((m) =>
              typeof m.content === 'string' ? m.content.substring(0, 200) : ''
            );
            const lang = detectLanguage(typeof userMsgs[0].content === 'string' ? userMsgs[0].content : '');
            const topicsFound = new Set();
            for (const msg of userMsgs) {
              if (typeof msg.content === 'string') topicsFound.add(detectTopic(msg.content));
            }

            const logKey = `log:${timestamp}:${Math.random().toString(36).slice(2, 8)}`;
            await env.CHATBOT_DATA.put(
              logKey,
              JSON.stringify({
                question: typeof userMsgs[userMsgs.length - 1].content === 'string'
                  ? userMsgs[userMsgs.length - 1].content.substring(0, 500)
                  : '',
                botReply: typeof agentResult.reply === 'string'
                  ? agentResult.reply.substring(0, 500)
                  : '',
                questions: allQuestions,
                messageCount: userMsgs.length,
                lang,
                topic: [...topicsFound][0] || 'general',
                topics: [...topicsFound],
                page,
                timestamp,
                v2_meta: {
                  iterations: agentResult.iterations,
                  tool_calls: agentResult.tool_calls?.map((t) => t.name) || [],
                  tool_inputs: agentResult.tool_calls?.map((t) => ({
                    name: t.name,
                    input: t.input,
                  })) || [],
                  cache_read: agentResult.usage?.cache_read_input_tokens || 0,
                  cache_creation: agentResult.usage?.cache_creation_input_tokens || 0,
                  input_tokens: agentResult.usage?.input_tokens || 0,
                  output_tokens: agentResult.usage?.output_tokens || 0,
                },
              }),
              { expirationTtl: 2592000 }
            );

            for (const topic of topicsFound) {
              const k = `count:topic:${date}:${topic}`;
              const c = parseInt((await env.CHATBOT_DATA.get(k)) || '0');
              await env.CHATBOT_DATA.put(k, String(c + 1), { expirationTtl: 7776000 });
            }
            const langK = `count:lang:${date}:${lang}`;
            const langC = parseInt((await env.CHATBOT_DATA.get(langK)) || '0');
            await env.CHATBOT_DATA.put(langK, String(langC + 1), { expirationTtl: 7776000 });

            const totalK = `count:total:${date}`;
            const totalC = parseInt((await env.CHATBOT_DATA.get(totalK)) || '0');
            await env.CHATBOT_DATA.put(totalK, String(totalC + 1), { expirationTtl: 7776000 });
          } catch (e) {
            console.error('Analytics error:', e);
          }
        })());
      }

      return new Response(JSON.stringify({ reply: agentResult.reply }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Worker error:', err);

      // Detectar idioma del último mensaje del usuario (para responder en el idioma correcto)
      let userLang = 'en';
      try {
        const reqClone = await request.clone().json();
        const userMsgs = (reqClone.messages || []).filter((m) => m.role === 'user');
        if (userMsgs.length > 0) {
          const lastContent = typeof userMsgs[userMsgs.length - 1].content === 'string'
            ? userMsgs[userMsgs.length - 1].content : '';
          userLang = detectLanguage(lastContent);
        }
      } catch (e) { /* ignorar; usaremos default 'en' */ }

      // Mensaje amable según idioma. Mantener corto y conversacional.
      const friendlyMessage = {
        es: 'Disculpa, tuve un fallo momentaneo. Intenta de nuevo en unos segundos. Si persiste, contacta a Ernesto en https://ernestocisneros.art/contact .',
        en: 'Sorry, I had a momentary glitch. Please try again in a few seconds. If it persists, contact Ernesto at https://ernestocisneros.art/contact .',
        fr: 'Desole, j\'ai eu un probleme momentane. Reessayez dans quelques secondes. Si le probleme persiste, contactez Ernesto sur https://ernestocisneros.art/contact .',
        it: 'Mi dispiace, ho avuto un problema momentaneo. Riprova tra qualche secondo. Se persiste, contatta Ernesto su https://ernestocisneros.art/contact .',
        ja: '申し訳ありません、一時的な問題がありました。数秒後にもう一度お試しください。',
        ko: '죄송합니다, 일시적인 문제가 있었습니다. 잠시 후 다시 시도해 주세요.',
        ru: 'Извините, произошла временная ошибка. Попробуйте через несколько секунд.',
      }[userLang] || 'Sorry, I had a momentary glitch. Please try again in a few seconds.';

      // Loguear el error en KV para diagnostico (no bloqueante)
      if (env.CHATBOT_DATA && ctx?.waitUntil) {
        ctx.waitUntil((async () => {
          try {
            const timestamp = new Date().toISOString();
            const errorKey = `error:${timestamp}:${Math.random().toString(36).slice(2, 8)}`;
            let lastQuestion = '';
            try {
              const reqClone2 = await request.clone().json();
              const userMsgs2 = (reqClone2.messages || []).filter((m) => m.role === 'user');
              if (userMsgs2.length > 0) {
                lastQuestion = typeof userMsgs2[userMsgs2.length - 1].content === 'string'
                  ? userMsgs2[userMsgs2.length - 1].content.substring(0, 300) : '';
              }
            } catch (e) {}
            await env.CHATBOT_DATA.put(errorKey, JSON.stringify({
              timestamp,
              error: String(err.message || err).substring(0, 500),
              question: lastQuestion,
              lang: userLang,
              page: (request.headers.get('Referer') || '').replace('https://ernestocisneros.art', '').split('?')[0] || '/',
            }), { expirationTtl: 2592000 }); // 30 dias
          } catch (e) { console.error('Error logging failed:', e); }
        })());
      }

      // Devolver respuesta amable como respuesta normal (HTTP 200), no error
      return new Response(JSON.stringify({ reply: friendlyMessage }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
