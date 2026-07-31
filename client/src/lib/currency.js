export function formatINR(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '₹0';

  if (n >= 1_00_00_000) {
    return `₹${trimZero(n / 1_00_00_000)} Cr`;
  }
  if (n >= 1_00_000) {
    return `₹${trimZero(n / 1_00_000)} Lakh`;
  }
  return `₹${n.toLocaleString('en-IN')}`;
}

function trimZero(n) {
  return Number(n.toFixed(2)).toString();
}
