/**
 * Lightweight, zero-dependency QR Code Generator (ISO/IEC 18004 compliant)
 * Used to generate dynamic, genuine UPI payment QR codes for Occasions checkout.
 */

class QrSegment {
  mode: number;
  numChars: number;
  bitData: number[];

  constructor(mode: number, numChars: number, bitData: number[]) {
    this.mode = mode;
    this.numChars = numChars;
    this.bitData = bitData;
  }

  static makeBytes(data: Uint8Array): QrSegment {
    const bb: number[] = [];
    for (const b of data) {
      for (let i = 7; i >= 0; i--) bb.push((b >>> i) & 1);
    }
    return new QrSegment(0x4, data.length, bb);
  }

  static getTotalBits(segs: QrSegment[], version: number): number {
    let result = 0;
    for (const seg of segs) {
      const ccbits = version < 10 ? 8 : 16;
      if (seg.numChars >= (1 << ccbits)) return -1;
      result += 4 + ccbits + seg.bitData.length;
    }
    return result;
  }
}

export class QrCode {
  version: number;
  errorCorrectionLevel: number;
  size: number;
  modules: boolean[][];
  isFunction: boolean[][];
  mask: number;

  static EXP_TABLE = new Uint8Array(256);
  static LOG_TABLE = new Uint8Array(256);

  static ECC_CODEWORDS_PER_BLOCK = [
    [-1,  7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  ];

  static NUM_ERROR_CORRECTION_BLOCKS = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
  ];

  static initTables() {
    let cur = 1;
    for (let i = 0; i < 255; i++) {
      QrCode.EXP_TABLE[i] = cur;
      QrCode.LOG_TABLE[cur] = i;
      cur = (cur << 1) ^ (cur >= 128 ? 0x11D : 0);
    }
    QrCode.EXP_TABLE[255] = QrCode.EXP_TABLE[0];
  }

  constructor(version: number, errorCorrectionLevel: number, dataCodewords: Uint8Array, msk: number) {
    this.version = version;
    this.errorCorrectionLevel = errorCorrectionLevel;
    this.size = version * 4 + 17;

    this.modules = Array.from({ length: this.size }, () => Array(this.size).fill(false));
    this.isFunction = Array.from({ length: this.size }, () => Array(this.size).fill(false));

    this.drawFunctionPatterns();
    const allCodewords = this.addEccAndInterleave(dataCodewords);
    this.drawCodewords(allCodewords);

    if (msk < 0 || msk > 7) {
      let minPenalty = 1e9;
      let bestMask = 0;
      for (let i = 0; i < 8; i++) {
        this.applyMask(i);
        this.drawFormatBits(i);
        const penalty = this.getPenaltyScore();
        if (penalty < minPenalty) {
          minPenalty = penalty;
          bestMask = i;
        }
        this.applyMask(i);
      }
      msk = bestMask;
    }
    this.mask = msk;
    this.applyMask(msk);
    this.drawFormatBits(msk);
  }

  static encodeText(text: string, ecl: number = 1): QrCode {
    if (QrCode.EXP_TABLE[0] === 0) QrCode.initTables();
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    const seg = QrSegment.makeBytes(bytes);

    for (let version = 1; version <= 40; version++) {
      const dataCapacityBits = QrCode.getNumDataCodewords(version, ecl) * 8;
      const dataUsedBits = QrSegment.getTotalBits([seg], version);
      if (dataUsedBits !== -1 && dataUsedBits <= dataCapacityBits) {
        const bb: number[] = [];
        QrCode.appendBits(seg.mode, 4, bb);
        QrCode.appendBits(seg.numChars, version < 10 ? 8 : 16, bb);
        for (const b of seg.bitData) bb.push(b);

        QrCode.appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
        QrCode.appendBits(0, (8 - (bb.length % 8)) % 8, bb);
        for (let padByte = 0xEC; bb.length < dataCapacityBits; padByte ^= 0xEC ^ 0x11) {
          QrCode.appendBits(padByte, 8, bb);
        }

        const dataBytes = new Uint8Array(bb.length / 8);
        for (let i = 0; i < bb.length; i++) dataBytes[i >>> 3] |= bb[i] << (7 - (i & 7));
        return new QrCode(version, ecl, dataBytes, -1);
      }
    }
    throw new Error("Text too long for QR Code");
  }

  static appendBits(val: number, len: number, bb: number[]) {
    for (let i = len - 1; i >= 0; i--) bb.push((val >>> i) & 1);
  }

  private drawFunctionPatterns() {
    const s = this.size;
    this.drawFinderPattern(3, 3);
    this.drawFinderPattern(s - 4, 3);
    this.drawFinderPattern(3, s - 4);

    for (let i = 0; i < s; i++) {
      this.setFunctionModule(6, i, i % 2 === 0);
      this.setFunctionModule(i, 6, i % 2 === 0);
    }

    const alignPos = QrCode.getAlignmentPatternPositions(this.version);
    const numAlign = alignPos.length;
    for (let i = 0; i < numAlign; i++) {
      for (let j = 0; j < numAlign; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === numAlign - 1) || (i === numAlign - 1 && j === 0)) continue;
        this.drawAlignmentPattern(alignPos[i], alignPos[j]);
      }
    }

    this.drawFormatBits(0);
    this.drawVersion();
  }

  private drawFinderPattern(x: number, y: number) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const qx = x + dx;
        const qy = y + dy;
        if (qx >= 0 && qx < this.size && qy >= 0 && qy < this.size) {
          this.setFunctionModule(qx, qy, dist !== 2 && dist !== 4);
        }
      }
    }
  }

  private drawAlignmentPattern(x: number, y: number) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  private setFunctionModule(x: number, y: number, isDark: boolean) {
    this.modules[y][x] = isDark;
    this.isFunction[y][x] = true;
  }

  private drawFormatBits(mask: number) {
    const eclBits = [1, 0, 3, 2][this.errorCorrectionLevel];
    const data = (eclBits << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;

    for (let i = 0; i <= 5; i++) this.modules[8][i] = ((bits >>> i) & 1) !== 0;
    this.modules[8][7] = ((bits >>> 6) & 1) !== 0;
    this.modules[8][8] = ((bits >>> 7) & 1) !== 0;
    this.modules[7][8] = ((bits >>> 8) & 1) !== 0;
    for (let i = 9; i < 15; i++) this.modules[14 - i][8] = ((bits >>> i) & 1) !== 0;

    const s = this.size;
    for (let i = 0; i < 8; i++) this.modules[s - 1 - i][8] = ((bits >>> i) & 1) !== 0;
    for (let i = 8; i < 15; i++) this.modules[8][s - 15 + i] = ((bits >>> i) & 1) !== 0;
    this.modules[8][s - 8] = true;
  }

  private drawVersion() {
    if (this.version < 7) return;
    let rem = this.version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
    const bits = (this.version << 12) | rem;
    const s = this.size;
    for (let i = 0; i < 18; i++) {
      const bit = ((bits >>> i) & 1) !== 0;
      const a = s - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.setFunctionModule(a, b, bit);
      this.setFunctionModule(b, a, bit);
    }
  }

  private addEccAndInterleave(data: Uint8Array): number[] {
    const ver = this.version;
    const ecl = this.errorCorrectionLevel;
    const numBlocks = QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl][ver];
    const blockEccLen = QrCode.ECC_CODEWORDS_PER_BLOCK[ecl][ver];
    const rawCodewords = Math.floor(QrCode.getNumRawDataModules(ver) / 8);
    const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
    const shortBlockLen = Math.floor(rawCodewords / numBlocks);

    const blocks: { data: Uint8Array; ecc: number[] }[] = [];
    const rs = QrCode.reedSolomonComputeDivisor(blockEccLen);
    for (let i = 0, k = 0; i < numBlocks; i++) {
      const datLen = shortBlockLen - blockEccLen + (i >= numShortBlocks ? 1 : 0);
      const dat = data.slice(k, k + datLen);
      k += datLen;
      const ecc = QrCode.reedSolomonComputeRemainder(dat, rs);
      blocks.push({ data: dat, ecc });
    }

    const res: number[] = [];
    for (let i = 0; i < shortBlockLen - blockEccLen + 1; i++) {
      for (let j = 0; j < numBlocks; j++) {
        if (i < blocks[j].data.length) res.push(blocks[j].data[i]);
      }
    }
    for (let i = 0; i < blockEccLen; i++) {
      for (let j = 0; j < numBlocks; j++) {
        res.push(blocks[j].ecc[i]);
      }
    }
    return res;
  }

  private drawCodewords(allCodewords: number[]) {
    const s = this.size;
    let i = 0;
    for (let right = s - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < s; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? s - 1 - vert : vert;
          if (!this.isFunction[y][x] && i < allCodewords.length * 8) {
            this.modules[y][x] = ((allCodewords[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
            i++;
          }
        }
      }
    }
  }

  private applyMask(mask: number) {
    const s = this.size;
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        if (this.isFunction[y][x]) continue;
        let invert = false;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          case 7: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
        }
        if (invert) this.modules[y][x] = !this.modules[y][x];
      }
    }
  }

  private getPenaltyScore(): number {
    const s = this.size;
    let result = 0;
    for (let y = 0; y < s; y++) {
      let runColor = false, runLen = 0;
      for (let x = 0; x < s; x++) {
        if (this.modules[y][x] === runColor) {
          runLen++;
          if (runLen === 5) result += 3;
          else if (runLen > 5) result += 1;
        } else {
          runColor = this.modules[y][x];
          runLen = 1;
        }
      }
    }
    for (let x = 0; x < s; x++) {
      let runColor = false, runLen = 0;
      for (let y = 0; y < s; y++) {
        if (this.modules[y][x] === runColor) {
          runLen++;
          if (runLen === 5) result += 3;
          else if (runLen > 5) result += 1;
        } else {
          runColor = this.modules[y][x];
          runLen = 1;
        }
      }
    }
    return result;
  }

  toSvgString(margin: number = 4): string {
    const totalSize = this.size + margin * 2;
    let path = "";
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.modules[y][x]) {
          path += `M${x + margin},${y + margin}h1v1h-1z `;
        }
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#ffffff"/><path d="${path.trim()}" fill="#000000"/></svg>`;
  }

  toDataUrl(margin: number = 4): string {
    const svg = this.toSvgString(margin);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  private static reedSolomonComputeDivisor(degree: number): number[] {
    let result = [1];
    for (let i = 0; i < degree; i++) {
      const next: number[] = [];
      const root = QrCode.reedSolomonMultiply(1, QrCode.EXP_TABLE[i]);
      for (let j = 0; j < result.length; j++) {
        next.push(QrCode.reedSolomonMultiply(result[j], root));
      }
      next.push(0);
      for (let j = 0; j < result.length; j++) {
        next[j + 1] ^= result[j];
      }
      result = next;
    }
    return result;
  }

  private static reedSolomonComputeRemainder(data: Uint8Array, divisor: number[]): number[] {
    const result = new Array(divisor.length - 1).fill(0);
    for (const b of data) {
      const factor = b ^ result.shift();
      result.push(0);
      for (let i = 0; i < result.length; i++) {
        result[i] ^= QrCode.reedSolomonMultiply(divisor[i + 1], factor);
      }
    }
    return result;
  }

  private static reedSolomonMultiply(x: number, y: number): number {
    if (x === 0 || y === 0) return 0;
    return QrCode.EXP_TABLE[(QrCode.LOG_TABLE[x] + QrCode.LOG_TABLE[y]) % 255];
  }

  private static getNumDataCodewords(ver: number, ecl: number): number {
    return Math.floor(QrCode.getNumRawDataModules(ver) / 8) -
      QrCode.ECC_CODEWORDS_PER_BLOCK[ecl][ver] * QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl][ver];
  }

  private static getNumRawDataModules(ver: number): number {
    let result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      const numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }

  private static getAlignmentPatternPositions(ver: number): number[] {
    if (ver === 1) return [];
    const numAlign = Math.floor(ver / 7) + 2;
    const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
    const result = [6];
    for (let pos = ver * 4 + 10; result.length < numAlign; pos -= step) {
      result.splice(1, 0, pos);
    }
    return result;
  }
}

/**
 * Builds a standardized NPCI UPI Payment URI
 */
export function buildUpiPaymentUri(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionNote?: string;
  transactionRef?: string;
}): string {
  const cleanUpiId = params.upiId.trim();
  const cleanPayee = params.payeeName.trim();
  const cleanAmount = Number(params.amount || 0).toFixed(2);
  const note = (params.transactionNote || "Order Payment - Occasions").trim();

  let uri = `upi://pay?pa=${encodeURIComponent(cleanUpiId)}&pn=${encodeURIComponent(cleanPayee)}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
  if (params.transactionRef) {
    uri += `&tr=${encodeURIComponent(params.transactionRef)}`;
  }
  return uri;
}

/**
 * Generates an SVG Data URI for a UPI Payment request
 */
export function generateUpiQrDataUrl(params: {
  upiId: string;
  payeeName?: string;
  amount: number;
  transactionNote?: string;
  transactionRef?: string;
}): string {
  const uri = buildUpiPaymentUri({
    upiId: params.upiId,
    payeeName: params.payeeName || "Occasions Flowers & Gifts",
    amount: params.amount,
    transactionNote: params.transactionNote,
    transactionRef: params.transactionRef,
  });

  const qr = QrCode.encodeText(uri, 1); // Level M
  return qr.toDataUrl(4);
}
