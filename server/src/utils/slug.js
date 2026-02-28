// simple slug generator from a restaurant name
function makeSlug(name) {
  if (!name) return '';
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanum with hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

module.exports = { makeSlug };
