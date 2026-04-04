/**
 * ESCPOSBuilder Tests
 */

import { ESCPOSBuilder, TextAlignment, TextSize } from '../ESCPOSBuilder';

describe('ESCPOSBuilder', () => {
  let builder: ESCPOSBuilder;

  beforeEach(() => {
    builder = new ESCPOSBuilder();
  });

  describe('Basic Commands', () => {
    it('should initialize correctly', () => {
      const commands = builder.build();
      expect(commands).toBeInstanceOf(Uint8Array);
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should add text', () => {
      builder.text('Hello World');
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(2); // More than just init command
    });

    it('should add new lines', () => {
      builder.newLine(2);
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(2);
    });

    it('should reset builder', () => {
      builder.text('Test');
      builder.reset();
      const commands = builder.build();
      // Should only have init command after reset
      expect(commands.length).toBe(2);
    });
  });

  describe('Text Formatting', () => {
    it('should set text alignment', () => {
      builder.align(TextAlignment.CENTER).text('Centered');
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should set bold text', () => {
      builder.bold(true).text('Bold Text').bold(false);
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should set underline', () => {
      builder.underline(true).text('Underlined').underline(false);
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should set text size', () => {
      builder.setTextSize(TextSize.DOUBLE_HEIGHT).text('Large Text').setTextSize(TextSize.NORMAL);
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(0);
    });
  });

  describe('Layout Commands', () => {
    it('should add horizontal line', () => {
      builder.horizontalLine('-', 32);
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should add divider', () => {
      builder.divider();
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should add left-right aligned text', () => {
      builder.leftRight('Left', 'Right', 32);
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should add centered text', () => {
      builder.centerText('Centered Text');
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should add title', () => {
      builder.title('Invoice');
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should add subtitle', () => {
      builder.subtitle('Order #12345');
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(0);
    });
  });

  describe('Advanced Features', () => {
    it('should add QR code', () => {
      builder.qrCode('https://example.com');
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should feed paper', () => {
      builder.feed(3);
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should cut paper', () => {
      builder.cut();
      const commands = builder.build();
      expect(commands.length).toBeGreaterThan(0);
    });
  });

  describe('Complete Receipt', () => {
    it('should build a complete receipt', () => {
      builder
        .title('Test Store')
        .centerText('123 Main St')
        .divider()
        .leftRight('Item 1', '10.00')
        .leftRight('Item 2', '20.00')
        .divider()
        .bold(true)
        .leftRight('Total:', '30.00')
        .bold(false)
        .newLine(2)
        .centerText('Thank you!')
        .feed(3)
        .cut();

      const commands = builder.build();
      expect(commands).toBeInstanceOf(Uint8Array);
      expect(commands.length).toBeGreaterThan(50); // Should be a substantial command set
    });

    it('should build base64 string', () => {
      builder.text('Test');
      const base64 = builder.buildBase64();
      expect(typeof base64).toBe('string');
      expect(base64.length).toBeGreaterThan(0);
    });
  });
});
