/**
 * messageSanitizer.js
 *
 * Utilitário reutilizável para sanitização de mensagens do chat.
 * Aplica múltiplas camadas de proteção:
 *   1. Ocultação de links/URLs (substitui por marcador visual)
 *   2. Ocultação de telefones
 *   3. Censura parcial de palavrões (preserva início, esconde final)
 */

// ─────────────────────────────────────────────────────────────────
// LISTA DE PALAVRÕES
// ─────────────────────────────────────────────────────────────────
const OFFENSIVE_WORDS = [
  "foder",
  "fuder",
  "fudido",
  "fudida",
  "fudendo",
  "cacete",
  "desgraçado",
  "desgraçada",
  "puta",
  "puto",
  "porra",
  "caralho",
  "buceta",
  "xoxota",
  "viado",
  "vadia",
  "vagabunda",
  "vagabundo",
  "cuzão",
  "cuzao",
  "arrombado",
  "arrombada",
  "escroto",
  "escrota",
  "merda",
  "fdp",
  "safada",
  "safado",
  "desgraça",
  "desgraca",
  "corno",
  "corna",
  "boceta",
  "piroca",
  "pau",
  "rola",
  "cu",
  "bosta",
  "idiota",
  "imbecil",
  "retardado",
  "retardada",
  "otário",
  "otaria",
  "otario",
  "babaca",
  "cretino",
  "cretina",
  "putaria",
  "puteiro"
];

// Mapeamento exato de quantos caracteres deixar visível para cada palavra
const CUSTOM_VISIBILITY = {
  "puta": 1,
  "puto": 1,
  "porra": 3,
  "caralho": 4,
  "foder": 3,
  "fuder": 3,
  "fudido": 4,
  "fudida": 4,
  "fudendo": 4,
  "cacete": 4,
  "merda": 3,
  "bosta": 3,
  "desgraçado": 6,
  "desgraçada": 6,
  "otário": 3,
  "otaria": 3,
  "otario": 3,
  "arrombado": 7,
  "arrombada": 7,
  "viado": 3,
  "vagabundo": 4,
  "vagabunda": 4,
  "buceta": 4,
  "xoxota": 4,
  "cuzão": 3,
  "cuzao": 3,
  "escroto": 4,
  "escrota": 4,
  "fdp": 1,
  "safada": 4,
  "safado": 4,
  "desgraça": 6,
  "desgraca": 6,
  "corno": 3,
  "corna": 3,
  "boceta": 4,
  "piroca": 4,
  "pau": 1,
  "rola": 2,
  "cu": 1,
  "idiota": 4,
  "imbecil": 4,
  "retardado": 6,
  "retardada": 6,
  "babaca": 4,
  "cretino": 4,
  "cretina": 4,
  "putaria": 4,
  "puteiro": 4
};

function censorWord(match, originalWord) {
  const visibleCount = CUSTOM_VISIBILITY[originalWord] || Math.max(1, Math.floor(originalWord.length / 2));
  const start = match.slice(0, visibleCount);
  const stars = "*".repeat(Math.max(2, match.length - visibleCount));
  return start + stars;
}

function filterOffensiveWords(text) {
  let result = text;

  for (const word of OFFENSIVE_WORDS) {
    // Cria uma regex que permite caracteres repetidos (ex: caralhoooo)
    const regexPattern = word.split('').map(char => {
      const escaped = char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return escaped + "+";
    }).join('');

    // \b garante que matcheia a palavra inteira
    const regex = new RegExp(`\\b${regexPattern}\\b`, "gi");

    result = result.replace(regex, (match) => {
      const censored = censorWord(match, word);
      // Preserva capitalização original
      if (match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase()) {
        return censored.charAt(0).toUpperCase() + censored.slice(1);
      }
      return censored;
    });
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────
// DETECÇÃO E OCULTAÇÃO DE LINKS / WHATSAPP
// ─────────────────────────────────────────────────────────────────
const LINK_REGEX = /((https?:\/\/|www\.)[^\s]+|(wa\.me|api\.whatsapp|chat\.whatsapp|whatsapp\.com)(\/[^\s]*)?|discord\.gg\/[^\s]+|bit\.ly\/[^\s]+|tinyurl\.com\/[^\s]+|t\.me\/[^\s]+|[a-zA-Z0-9-]+\.(com|net|org|xyz|io|app|br|co|info|site|online|tv|me|cc|link|gg|fun|pro|shop|store|club|live|news|tech|dev|ai)([\/\?#][^\s]*)?)/gi;
const LINK_PLACEHOLDER = "🔗 Link oculto";

function filterLinks(text) {
  return text.replace(LINK_REGEX, LINK_PLACEHOLDER);
}

// ─────────────────────────────────────────────────────────────────
// DETECÇÃO DE TELEFONES
// ─────────────────────────────────────────────────────────────────
// Captura formatos como: 11999998888, 11 99999-8888, (11)99999-8888, 
// +55 11 99999-8888, 21 98888-7777, etc.
const PHONE_REGEX = /(?:\+\d{1,3}[\s-]*)?(?:\(\d{2}\)|\d{2})[\s-]*\d{4,5}[\s-]*\d{4}/g;
const PHONE_PLACEHOLDER = "📞 Telefone ocultado";

function filterPhones(text) {
  return text.replace(PHONE_REGEX, PHONE_PLACEHOLDER);
}

// ─────────────────────────────────────────────────────────────────
// EXPORTAÇÃO PRINCIPAL
// ─────────────────────────────────────────────────────────────────

/**
 * Sanitiza uma mensagem de chat.
 * A ordem importa: primeiro ocultar links/telefones, depois palavrões.
 */
export function sanitizeMessage(text) {
  if (!text || typeof text !== "string") return text;

  let sanitized = filterLinks(text);
  sanitized = filterPhones(sanitized);
  sanitized = filterOffensiveWords(sanitized);

  return sanitized;
}
