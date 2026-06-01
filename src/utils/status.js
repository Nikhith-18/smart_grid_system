export const statusColor = {
  NORMAL: '#32d583',
  ADVISORY: '#60a5fa',
  WARNING: '#facc15',
  CRITICAL: '#fb7185',
};

export const statusTone = {
  NORMAL: 'green',
  ADVISORY: 'blue',
  WARNING: 'yellow',
  CRITICAL: 'red',
};

export const riskLabel = (probability) => {
  if (probability >= 45) return 'CRITICAL';
  if (probability >= 18) return 'WARNING';
  if (probability >= 8) return 'ADVISORY';
  return 'NORMAL';
};
