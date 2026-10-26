import type { Participant, OrderItem } from '../types/database';
import type { RestaurantItem } from '../types/restaurant';

export interface ReceiptData {
  restaurant: RestaurantItem;
  participants: Participant[];
  orders: OrderItem[];
  roomCode: string;
  districtName?: string;
  cityName?: string;
  isUnanimous?: boolean;
  locale?: string;
}

/**
 * Draws a thermal paper receipt on a 1080x1920 canvas for Instagram Stories.
 * Returns a PNG File ready for navigator.share or direct download.
 */
export async function generateReceiptFile(data: ReceiptData): Promise<File> {
  const width = 1080;
  const height = 1920;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 1. Fill Background (Deep warm dark espresso)
  ctx.fillStyle = '#201614';
  ctx.fillRect(0, 0, width, height);

  // Subtle background grain dots / pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let x = 30; x < width; x += 60) {
    for (let y = 30; y < height; y += 60) {
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Background glow around receipt
  const radialGradient = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, 700);
  radialGradient.addColorStop(0, 'rgba(255, 215, 90, 0.12)');
  radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Receipt Paper Geometry
  const paperX = 110;
  const paperY = 130;
  const paperWidth = 860;
  const paperHeight = 1660;
  const toothWidth = 20;
  const toothDepth = 12;

  // Path for receipt paper with zigzag top and bottom cuts
  ctx.save();
  ctx.beginPath();

  // Top zigzag (left to right)
  ctx.moveTo(paperX, paperY);
  const numTeethTop = Math.floor(paperWidth / toothWidth);
  for (let i = 0; i < numTeethTop; i++) {
    const curX = paperX + i * toothWidth;
    ctx.lineTo(curX + toothWidth / 2, paperY - toothDepth);
    ctx.lineTo(curX + toothWidth, paperY);
  }

  // Right edge
  ctx.lineTo(paperX + paperWidth, paperY + paperHeight);

  // Bottom zigzag (right to left)
  for (let i = numTeethTop; i > 0; i--) {
    const curX = paperX + (i - 1) * toothWidth;
    ctx.lineTo(curX + toothWidth / 2, paperY + paperHeight + toothDepth);
    ctx.lineTo(curX, paperY + paperHeight);
  }

  // Left edge
  ctx.lineTo(paperX, paperY);
  ctx.closePath();

  // Shadow for receipt paper
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 45;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 16;

  // Receipt paper fill (Thermal paper off-white cream)
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ctx.restore();

  // Draw 2px dark border around receipt
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#241B18';
  ctx.stroke();
  ctx.restore();

  // Receipt Content Drawing Helpers
  const centerX = width / 2;
  let cursorY = paperY + 65;

  const drawDashedLine = (y: number) => {
    ctx.save();
    ctx.strokeStyle = '#8E827A';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(paperX + 40, y);
    ctx.lineTo(paperX + paperWidth - 40, y);
    ctx.stroke();
    ctx.restore();
  };

  // Header Logo & Branding
  ctx.fillStyle = '#241B18';
  ctx.textAlign = 'center';
  ctx.font = '900 48px Alexandria, sans-serif';
  ctx.fillText('WESH NAKUL // وش ناكل', centerX, cursorY);

  cursorY += 40;
  ctx.fillStyle = '#7A6E67';
  ctx.font = '700 24px Alexandria, sans-serif';
  ctx.fillText('OFFICIAL SQUAD FOOD RECEIPT', centerX, cursorY);

  cursorY += 34;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const locationTag = `${data.cityName || 'JEDDAH'} • ${data.districtName || 'KSA'}`;
  ctx.font = '600 21px Courier, monospace';
  ctx.fillText(`${dateStr} ${timeStr}  |  ${locationTag}`, centerX, cursorY);

  cursorY += 30;
  ctx.font = '800 24px Courier, monospace';
  ctx.fillStyle = '#241B18';
  ctx.fillText(`ROOM CODE: ${data.roomCode || 'SQUAD'}`, centerX, cursorY);

  cursorY += 30;
  drawDashedLine(cursorY);

  // Winner Restaurant Section
  cursorY += 60;
  ctx.fillStyle = '#E55812';
  ctx.font = '900 24px Alexandria, sans-serif';
  ctx.fillText('★ SQUAD CONSENSUS WINNER ★', centerX, cursorY);

  cursorY += 65;
  const rName =
    data.locale === 'ar'
      ? data.restaurant.nameAr || data.restaurant.name || data.restaurant.nameEn || 'مطعم القروب'
      : data.restaurant.nameEn || data.restaurant.name || data.restaurant.nameAr || 'Squad Pick';

  ctx.fillStyle = '#241B18';
  ctx.font = '900 58px Alexandria, sans-serif';
  ctx.fillText(rName, centerX, cursorY);

  cursorY += 42;
  const metaParts: string[] = [];
  if (data.restaurant.priceTier) metaParts.push(data.restaurant.priceTier);
  if (data.restaurant.rating) metaParts.push(`⭐ ${Number(data.restaurant.rating).toFixed(1)}`);
  metaParts.push(data.isUnanimous ? '100% UNANIMOUS' : 'SQUAD CHOICE');

  ctx.fillStyle = '#55B96A';
  ctx.font = '800 24px Alexandria, sans-serif';
  ctx.fillText(metaParts.join('  •  '), centerX, cursorY);

  const sigDish =
    data.locale === 'ar'
      ? data.restaurant.signatureDishAr || data.restaurant.signatureDishEn
      : data.restaurant.signatureDishEn || data.restaurant.signatureDishAr;

  if (sigDish && sigDish.trim().toLowerCase() !== rName.trim().toLowerCase()) {
    cursorY += 40;
    ctx.fillStyle = '#7A6E67';
    ctx.font = '700 22px Alexandria, sans-serif';
    ctx.fillText(`Signature Dish: "${sigDish.trim()}"`, centerX, cursorY);
  }

  cursorY += 40;
  drawDashedLine(cursorY);

  // Squad Members Section
  cursorY += 55;
  ctx.fillStyle = '#241B18';
  ctx.font = '900 26px Alexandria, sans-serif';
  ctx.fillText(`SQUAD CREW (${data.participants.length} VOTERS)`, centerX, cursorY);

  cursorY += 40;
  const names = data.participants.map((p) => `✓ ${p.nickname}`).join('   ');
  ctx.fillStyle = '#3E3430';
  ctx.font = '700 22px Alexandria, sans-serif';
  ctx.fillText(names.length > 55 ? names.slice(0, 52) + '...' : names, centerX, cursorY);

  cursorY += 35;
  drawDashedLine(cursorY);

  // Orders Scratchpad Section
  cursorY += 55;
  ctx.fillStyle = '#241B18';
  ctx.font = '900 26px Alexandria, sans-serif';
  ctx.fillText(`SQUAD ORDERS (${data.orders.length} ITEMS)`, centerX, cursorY);

  cursorY += 20;
  ctx.textAlign = 'left';
  const orderStartX = paperX + 70;

  if (data.orders.length === 0) {
    cursorY += 40;
    ctx.fillStyle = '#9E928A';
    ctx.textAlign = 'center';
    ctx.font = '600 22px Courier, monospace';
    ctx.fillText('No individual items logged — ordering live!', centerX, cursorY);
    cursorY += 20;
  } else {
    const displayedOrders = data.orders.slice(0, 6);
    displayedOrders.forEach((item, idx) => {
      cursorY += 38;
      ctx.fillStyle = '#241B18';
      ctx.font = '700 22px Courier, monospace';
      const itemTitle = `${idx + 1}. [${item.participantName}] ${item.itemName}`;
      ctx.fillText(itemTitle.length > 38 ? itemTitle.slice(0, 36) + '..' : itemTitle, orderStartX, cursorY);

      if (item.notes && item.notes.trim()) {
        cursorY += 26;
        ctx.fillStyle = '#7A6E67';
        ctx.font = '500 18px Courier, monospace';
        ctx.fillText(`    ↳ note: ${item.notes.trim()}`, orderStartX, cursorY);
      }
    });

    if (data.orders.length > 6) {
      cursorY += 34;
      ctx.fillStyle = '#7A6E67';
      ctx.font = '600 20px Courier, monospace';
      ctx.fillText(`+ ${data.orders.length - 6} more items on the squad list`, orderStartX, cursorY);
    }
  }

  ctx.textAlign = 'center';
  cursorY += 35;
  drawDashedLine(cursorY);

  // Procedural Thermal Barcode Graphic
  cursorY += 45;
  const barcodeWidth = 460;
  const barcodeHeight = 70;
  const barcodeStartX = centerX - barcodeWidth / 2;

  ctx.fillStyle = '#1C1514';
  let curBarX = barcodeStartX;
  // Deterministic seed pattern based on room code
  const codeSeed = (data.roomCode || 'SQUAD').split('').reduce((acc, c) => acc + c.charCodeAt(0), 17);
  let step = 0;
  while (curBarX < barcodeStartX + barcodeWidth) {
    const barW = ((step * 7 + codeSeed) % 5) + 2; // 2 to 6 px
    const gapW = ((step * 3 + codeSeed) % 4) + 2; // 2 to 5 px
    ctx.fillRect(curBarX, cursorY, barW, barcodeHeight);
    curBarX += barW + gapW;
    step++;
  }

  cursorY += barcodeHeight + 25;
  ctx.fillStyle = '#241B18';
  ctx.font = '700 22px Courier, monospace';
  ctx.fillText(`* WN-${(data.roomCode || 'SQUAD').toUpperCase()}-${dateStr.replace(/\s+/g, '')} *`, centerX, cursorY);

  // Footer Tagline
  cursorY += 50;
  ctx.fillStyle = '#7A6E67';
  ctx.font = '800 20px Alexandria, sans-serif';
  ctx.fillText('NO MORE ARGUING OVER FOOD • WESHNAKUL.COM', centerX, cursorY);

  cursorY += 28;
  ctx.fillStyle = '#9E928A';
  ctx.font = '700 18px Alexandria, sans-serif';
  ctx.fillText('قررنا وانتهينا 🍔', centerX, cursorY);

  // Convert to Blob and then File
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create receipt image blob'));
          return;
        }
        const fileName = `wesh-nakul-receipt-${(data.roomCode || 'squad').toLowerCase()}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });
        resolve(file);
      },
      'image/png',
      0.95
    );
  });
}
