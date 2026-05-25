import QRCode from 'qrcode';

export type QrFormat = 'png' | 'svg';

const DEFAULT_OPTIONS = {
  errorCorrectionLevel: 'M' as const,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
} satisfies QRCode.QRCodeToBufferOptions;

export async function renderQrPng(payload: string, width = 512): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    ...DEFAULT_OPTIONS,
    type: 'png',
    width,
  });
}

export async function renderQrSvg(payload: string): Promise<string> {
  return QRCode.toString(payload, {
    ...DEFAULT_OPTIONS,
    type: 'svg',
  });
}
