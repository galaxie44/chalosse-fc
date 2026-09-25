export function formatDateFr(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function fullName(person: { first_name: string; last_name: string }) {
  return `${person.first_name} ${person.last_name.toUpperCase()}`;
}
