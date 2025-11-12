const QR_API = 'https://api.qrserver.com/v1/create-qr-code/';

export function buildQrUrl(url: string) {
  const params = new URLSearchParams({ size: '220x220', data: url, margin: '1' });
  return `${QR_API}?${params.toString()}`;
}
