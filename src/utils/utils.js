/** YYYY-MM-DD */
function getCurrentTimeString() {
  let d = new Date();
  d.setUTCHours(d.getUTCHours() + 8);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}
