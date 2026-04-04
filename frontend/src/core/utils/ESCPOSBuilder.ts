/**
 * ESC/POS Command Builder
 * Utility for generating ESC/POS commands for thermal printers
 */

import { encode as base64Encode } from 'base-64';

export enum TextAlignment {
  LEFT = 0,
  CENTER = 1,
  RIGHT = 2,
}

export enum TextSize {
  NORMAL = 0,
  DOUBLE_HEIGHT = 1,
  DOUBLE_WIDTH = 2,
  DOUBLE_HEIGHT_WIDTH = 3,
}

export enum BarcodeType {
  UPC_A = 65,
  UPC_E = 66,
  EAN13 = 67,
  EAN8 = 68,
  CODE39 = 69,
  CODE128 = 73,
}

export class ESCPOSBuilder {
  private commands: number[] = [];

  // ESC/POS Commands
  private static readonly ESC = 0x1b;
  private static readonly GS = 0x1d;
  private static readonly LF = 0x0a;
  private static readonly CR = 0x0d;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize printer
   */
  initialize(): ESCPOSBuilder {
    this.commands.push(ESCPOSBuilder.ESC, 0x40);
    return this;
  }

  /**
   * Add text
   */
  text(text: string): ESCPOSBuilder {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    this.commands.push(...bytes);
    return this;
  }

  /**
   * Add a new line
   */
  newLine(count: number = 1): ESCPOSBuilder {
    for (let i = 0; i < count; i++) {
      this.commands.push(ESCPOSBuilder.LF);
    }
    return this;
  }

  /**
   * Set text alignment
   */
  align(alignment: TextAlignment): ESCPOSBuilder {
    this.commands.push(ESCPOSBuilder.ESC, 0x61, alignment);
    return this;
  }

  /**
   * Set text size
   */
  setTextSize(size: TextSize): ESCPOSBuilder {
    this.commands.push(ESCPOSBuilder.GS, 0x21, size);
    return this;
  }

  /**
   * Set bold text
   */
  bold(enabled: boolean = true): ESCPOSBuilder {
    this.commands.push(ESCPOSBuilder.ESC, 0x45, enabled ? 1 : 0);
    return this;
  }

  /**
   * Set underline
   */
  underline(enabled: boolean = true): ESCPOSBuilder {
    this.commands.push(ESCPOSBuilder.ESC, 0x2d, enabled ? 1 : 0);
    return this;
  }

  /**
   * Add horizontal line
   */
  horizontalLine(char: string = '-', width: number = 32): ESCPOSBuilder {
    this.text(char.repeat(width));
    return this.newLine();
  }

  /**
   * Add a divider
   */
  divider(): ESCPOSBuilder {
    return this.horizontalLine('=', 32);
  }

  /**
   * Add left-right aligned text
   */
  leftRight(left: string, right: string, width: number = 32): ESCPOSBuilder {
    const spaces = width - left.length - right.length;
    if (spaces > 0) {
      this.text(left + ' '.repeat(spaces) + right);
    } else {
      this.text(left);
      this.newLine();
      this.text(right);
    }
    return this.newLine();
  }

  /**
   * Add centered text
   */
  centerText(text: string): ESCPOSBuilder {
    return this.align(TextAlignment.CENTER).text(text).align(TextAlignment.LEFT);
  }

  /**
   * Add title (centered, bold, double height)
   */
  title(text: string): ESCPOSBuilder {
    return this.align(TextAlignment.CENTER)
      .setTextSize(TextSize.DOUBLE_HEIGHT)
      .bold(true)
      .text(text)
      .bold(false)
      .setTextSize(TextSize.NORMAL)
      .align(TextAlignment.LEFT)
      .newLine();
  }

  /**
   * Add subtitle (centered, bold)
   */
  subtitle(text: string): ESCPOSBuilder {
    return this.align(TextAlignment.CENTER)
      .bold(true)
      .text(text)
      .bold(false)
      .align(TextAlignment.LEFT)
      .newLine();
  }

  /**
   * Add barcode
   */
  barcode(data: string, type: BarcodeType = BarcodeType.CODE128): ESCPOSBuilder {
    this.commands.push(ESCPOSBuilder.GS, 0x6b, type);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);
    this.commands.push(bytes.length, ...bytes);
    return this.newLine();
  }

  /**
   * Add QR code
   */
  qrCode(data: string, size: number = 6): ESCPOSBuilder {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);
    const len = bytes.length;

    // Set QR code model
    this.commands.push(ESCPOSBuilder.GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
    
    // Set QR code size
    this.commands.push(ESCPOSBuilder.GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, size);
    
    // Store QR code data
    this.commands.push(
      ESCPOSBuilder.GS, 0x28, 0x6b,
      (len + 3) & 0xff, ((len + 3) >> 8) & 0xff,
      0x31, 0x50, 0x30,
      ...bytes
    );
    
    // Print QR code
    this.commands.push(ESCPOSBuilder.GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30);
    
    return this.newLine();
  }

  /**
   * Cut paper
   */
  cut(partial: boolean = false): ESCPOSBuilder {
    this.commands.push(ESCPOSBuilder.GS, 0x56, partial ? 1 : 0);
    return this;
  }

  /**
   * Feed paper
   */
  feed(lines: number = 3): ESCPOSBuilder {
    this.commands.push(ESCPOSBuilder.ESC, 0x64, lines);
    return this;
  }

  /**
   * Build and return the command buffer
   */
  build(): Uint8Array {
    return new Uint8Array(this.commands);
  }

  /**
   * Build and return as base64 string using base-64 library
   */
  buildBase64(): string {
    const buffer = this.build();
    let binaryString = '';
    for (let i = 0; i < buffer.length; i++) {
      binaryString += String.fromCharCode(buffer[i]);
    }
    // Use base-64 library for reliable encoding
    return base64Encode(binaryString);
  }

  /**
   * Reset the builder
   */
  reset(): ESCPOSBuilder {
    this.commands = [];
    this.initialize();
    return this;
  }
}

export default ESCPOSBuilder;
