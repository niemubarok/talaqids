import { getJuzMeta, SURAHS } from '@/lib/quran-metadata';
import { formatChildAge, type CycleStatus } from '@/lib/cycle-math';

export type ShareCardFormat = 'story' | 'square';
export type ShareCardTheme = 'emerald' | 'parchment' | 'gold';

export interface ShareProgressPayload {
  childName: string;
  birthDate: string;
  cycle: CycleStatus;
  activeDaysCount: number;
  totalListenMinutes: number;
  totalCompletedPagesCount: number;
  format: ShareCardFormat;
  theme: ShareCardTheme;
  showChildName: boolean;
  showStats: boolean;
}

interface ThemePalette {
  bgStops: [string, string, string];
  glowColor: string;
  ringDecor: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  cardBg: string;
  cardBorder: string;
  trackBg: string;
  juzDoneBg: string;
  juzDoneText: string;
  juzActiveBg: string;
  juzActiveText: string;
  juzTodoBg: string;
  juzTodoText: string;
  footerDivider: string;
}

const THEME_PALETTES: Record<ShareCardTheme, ThemePalette> = {
  emerald: {
    bgStops: ['#0B241E', '#153C32', '#1E4C40'],
    glowColor: 'rgba(200, 155, 78, 0.22)',
    ringDecor: 'rgba(234, 216, 175, 0.12)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.78)',
    textMuted: 'rgba(255, 255, 255, 0.56)',
    accent: '#E4C486',
    accentSoft: '#EAD8AF',
    pillBg: 'rgba(255, 255, 255, 0.10)',
    pillBorder: 'rgba(255, 255, 255, 0.18)',
    pillText: '#EAD8AF',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    cardBorder: 'rgba(255, 255, 255, 0.14)',
    trackBg: 'rgba(255, 255, 255, 0.14)',
    juzDoneBg: '#E4C486',
    juzDoneText: '#15231E',
    juzActiveBg: '#FFFFFF',
    juzActiveText: '#0F2C25',
    juzTodoBg: 'rgba(255, 255, 255, 0.10)',
    juzTodoText: 'rgba(255, 255, 255, 0.55)',
    footerDivider: 'rgba(255, 255, 255, 0.14)',
  },
  parchment: {
    bgStops: ['#FCF8EE', '#F6F0E4', '#EDE3CE'],
    glowColor: 'rgba(200, 155, 78, 0.20)',
    ringDecor: 'rgba(30, 76, 64, 0.08)',
    textPrimary: '#15231E',
    textSecondary: '#354942',
    textMuted: '#6B7A72',
    accent: '#1E4C40',
    accentSoft: '#C89B4E',
    pillBg: 'rgba(30, 76, 64, 0.08)',
    pillBorder: 'rgba(30, 76, 64, 0.16)',
    pillText: '#1E4C40',
    cardBg: 'rgba(255, 255, 255, 0.72)',
    cardBorder: 'rgba(30, 76, 64, 0.12)',
    trackBg: 'rgba(30, 76, 64, 0.12)',
    juzDoneBg: '#1E4C40',
    juzDoneText: '#F3E7CB',
    juzActiveBg: '#C89B4E',
    juzActiveText: '#15231E',
    juzTodoBg: 'rgba(30, 76, 64, 0.08)',
    juzTodoText: '#6B7A72',
    footerDivider: 'rgba(30, 76, 64, 0.12)',
  },
  gold: {
    bgStops: ['#FBF3E2', '#F3E1B9', '#E6C88A'],
    glowColor: 'rgba(255, 255, 255, 0.45)',
    ringDecor: 'rgba(15, 44, 37, 0.09)',
    textPrimary: '#0F2C25',
    textSecondary: '#244A40',
    textMuted: '#4A685F',
    accent: '#0F2C25',
    accentSoft: '#8B6524',
    pillBg: 'rgba(15, 44, 37, 0.10)',
    pillBorder: 'rgba(15, 44, 37, 0.18)',
    pillText: '#0F2C25',
    cardBg: 'rgba(255, 252, 245, 0.64)',
    cardBorder: 'rgba(15, 44, 37, 0.12)',
    trackBg: 'rgba(15, 44, 37, 0.12)',
    juzDoneBg: '#0F2C25',
    juzDoneText: '#FBF3E2',
    juzActiveBg: '#FFFFFF',
    juzActiveText: '#0F2C25',
    juzTodoBg: 'rgba(15, 44, 37, 0.09)',
    juzTodoText: '#3A584F',
    footerDivider: 'rgba(15, 44, 37, 0.14)',
  },
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function formatDurationCompact(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes} mnt`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours}j ${mins}m` : `${hours} jam`;
}

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawTruncatedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) {
  let output = text;
  if (ctx.measureText(output).width <= maxWidth) {
    ctx.fillText(output, x, y);
    return;
  }
  while (output.length > 1 && ctx.measureText(`${output}…`).width > maxWidth) {
    output = output.slice(0, -1);
  }
  ctx.fillText(`${output}…`, x, y);
}

export async function renderShareProgressCard(
  canvas: HTMLCanvasElement,
  payload: ShareProgressPayload
): Promise<void> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font readiness errors
    }
  }

  const isStory = payload.format === 'story';
  const width = 1080;
  const height = isStory ? 1920 : 1080;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const palette = THEME_PALETTES[payload.theme];
  const juzMeta = getJuzMeta(payload.cycle.currentJuz);
  const startSurah = SURAHS[juzMeta.startSurah];
  const endSurah = SURAHS[juzMeta.endSurah];

  const sansFont = '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  const arabicFont = '"Amiri", "Scheherazade New", serif';

  // 1. Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width * 0.85, height);
  bgGrad.addColorStop(0, palette.bgStops[0]);
  bgGrad.addColorStop(0.52, palette.bgStops[1]);
  bgGrad.addColorStop(1, palette.bgStops[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient radial glow & decorative rings
  const glow = ctx.createRadialGradient(width * 0.85, height * 0.1, 20, width * 0.85, height * 0.1, 620);
  glow.addColorStop(0, palette.glowColor);
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const glowBottom = ctx.createRadialGradient(width * 0.15, height * 0.9, 20, width * 0.15, height * 0.9, 520);
  glowBottom.addColorStop(0, palette.glowColor);
  glowBottom.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowBottom;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = palette.ringDecor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width - 60, 80, 260, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(width - 60, 80, 170, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  const padX = 84;
  const contentWidth = width - padX * 2;
  let cursorY = isStory ? 120 : 72;

  // 3. Top Badge Row
  const badgeText = payload.cycle.isConsolidationPhase
    ? `FASE MUROJA'AH · HARI ${payload.cycle.dayInCurrentCycle}/30`
    : `BULAN ${payload.cycle.currentMonth} · HARI ${payload.cycle.dayInCurrentCycle}/30`;

  ctx.font = `800 24px ${sansFont}`;
  const badgeMetrics = ctx.measureText(badgeText);
  const badgeW = badgeMetrics.width + 64;
  const badgeH = 54;
  const badgeX = (width - badgeW) / 2;

  drawRoundedRect(ctx, badgeX, cursorY, badgeW, badgeH, 27);
  ctx.fillStyle = palette.pillBg;
  ctx.fill();
  ctx.strokeStyle = palette.pillBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = palette.pillText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, width / 2, cursorY + badgeH / 2 + 1);

  cursorY += badgeH + (isStory ? 56 : 32);

  // 4. Child Name & Subtitle
  ctx.font = `700 22px ${sansFont}`;
  ctx.fillStyle = palette.textMuted;
  ctx.fillText("PERJALANAN AL-QUR'AN", width / 2, cursorY);

  cursorY += isStory ? 54 : 40;
  const displayName = payload.showChildName ? payload.childName : 'Buah Hati Kami';
  ctx.font = `800 ${isStory ? 68 : 52}px ${sansFont}`;
  ctx.fillStyle = palette.textPrimary;
  drawTruncatedText(ctx, displayName, width / 2, cursorY, contentWidth);

  cursorY += isStory ? 48 : 34;
  const ageText = payload.showChildName && payload.birthDate
    ? `Usia ${formatChildAge(payload.birthDate)} · `
    : '';
  const phaseSub = payload.cycle.isConsolidationPhase
    ? "Rotasi Cepat 30 Juz"
    : 'Metode Siklus 30 Hari';
  ctx.font = `600 ${isStory ? 28 : 23}px ${sansFont}`;
  ctx.fillStyle = palette.textSecondary;
  ctx.fillText(`${ageText}${phaseSub}`, width / 2, cursorY);

  // 5. Centerpiece Ring + Juz Info
  const ringRadius = isStory ? 170 : 114;
  const ringCenterY = cursorY + (isStory ? 235 : 148);
  const dayProgress = Math.min(1, Math.max(0, payload.cycle.dayInCurrentCycle / 30));

  // Track circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, ringCenterY, ringRadius, 0, Math.PI * 2);
  ctx.strokeStyle = palette.trackBg;
  ctx.lineWidth = isStory ? 18 : 13;
  ctx.stroke();

  // Progress arc
  ctx.beginPath();
  ctx.arc(
    width / 2,
    ringCenterY,
    ringRadius,
    -Math.PI / 2,
    -Math.PI / 2 + Math.PI * 2 * dayProgress
  );
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = isStory ? 18 : 13;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // Arabic Juz inside ring
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${isStory ? 66 : 44}px ${arabicFont}`;
  ctx.fillStyle = palette.accentSoft;
  ctx.fillText(juzMeta.nameArabic, width / 2, ringCenterY - (isStory ? 20 : 12));

  ctx.font = `800 ${isStory ? 28 : 20}px ${sansFont}`;
  ctx.fillStyle = palette.textSecondary;
  ctx.fillText(`JUZ ${payload.cycle.currentJuz}`, width / 2, ringCenterY + (isStory ? 52 : 36));

  cursorY = ringCenterY + ringRadius + (isStory ? 64 : 38);

  // Juz Title & Surah Range
  ctx.font = `800 ${isStory ? 44 : 32}px ${sansFont}`;
  ctx.fillStyle = palette.textPrimary;
  ctx.fillText(`Juz ${payload.cycle.currentJuz} · ${juzMeta.nameTransliteration}`, width / 2, cursorY);

  cursorY += isStory ? 42 : 30;
  ctx.font = `600 ${isStory ? 26 : 21}px ${sansFont}`;
  ctx.fillStyle = palette.textMuted;
  ctx.fillText(
    `${startSurah?.name ?? ''} – ${endSurah?.name ?? ''} (${juzMeta.surahList.length} Surah)`,
    width / 2,
    cursorY
  );

  // 6. Mini 30-Juz Curriculum Map (10 x 3 grid)
  cursorY += isStory ? 58 : 34;
  const mapCardPad = isStory ? 34 : 24;
  const cols = 10;
  const gap = isStory ? 12 : 10;
  const cellSize = Math.floor((contentWidth - mapCardPad * 2 - gap * (cols - 1)) / cols);
  const rows = 3;
  const mapCardH = mapCardPad * 2 + (isStory ? 44 : 32) + rows * cellSize + (rows - 1) * gap;

  drawRoundedRect(ctx, padX, cursorY, contentWidth, mapCardH, 32);
  ctx.fillStyle = palette.cardBg;
  ctx.fill();
  ctx.strokeStyle = palette.cardBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = `800 ${isStory ? 22 : 18}px ${sansFont}`;
  ctx.fillStyle = palette.textSecondary;
  ctx.fillText('PETA SIKLUS 30 JUZ', padX + mapCardPad, cursorY + mapCardPad + 10);

  ctx.textAlign = 'right';
  ctx.fillStyle = palette.accentSoft;
  ctx.fillText(
    `Hari ke-${(payload.cycle.totalDays ?? 0) + 1} / 900`,
    padX + contentWidth - mapCardPad,
    cursorY + mapCardPad + 10
  );

  const gridStartY = cursorY + mapCardPad + (isStory ? 44 : 34);
  for (let i = 0; i < 30; i++) {
    const juzNum = i + 1;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = padX + mapCardPad + col * (cellSize + gap);
    const cy = gridStartY + row * (cellSize + gap);

    const isCurrent = juzNum === payload.cycle.currentJuz;
    const isPassed = juzNum < payload.cycle.currentMonth;

    drawRoundedRect(ctx, cx, cy, cellSize, cellSize * 0.82, 14);
    if (isCurrent) {
      ctx.fillStyle = palette.juzActiveBg;
    } else if (isPassed) {
      ctx.fillStyle = palette.juzDoneBg;
    } else {
      ctx.fillStyle = palette.juzTodoBg;
    }
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${isStory ? 24 : 20}px ${sansFont}`;
    ctx.fillStyle = isCurrent
      ? palette.juzActiveText
      : isPassed
        ? palette.juzDoneText
        : palette.juzTodoText;
    ctx.fillText(String(juzNum), cx + cellSize / 2, cy + (cellSize * 0.82) / 2 + 1);
  }

  cursorY += mapCardH + (isStory ? 34 : 24);

  // 7. Stats Row (optional)
  if (payload.showStats) {
    const statGap = 18;
    const statW = (contentWidth - statGap * 2) / 3;
    const statH = isStory ? 168 : 120;

    const stats = [
      { label: 'HARI AKTIF', value: `${payload.activeDaysCount}`, unit: 'hari' },
      { label: 'TOTAL SIMAK', value: formatDurationCompact(payload.totalListenMinutes), unit: 'audio' },
      { label: 'TALAQQI MUSHAF', value: `${payload.totalCompletedPagesCount}`, unit: 'halaman' },
    ];

    stats.forEach((stat, idx) => {
      const sx = padX + idx * (statW + statGap);
      drawRoundedRect(ctx, sx, cursorY, statW, statH, 28);
      ctx.fillStyle = palette.cardBg;
      ctx.fill();
      ctx.strokeStyle = palette.cardBorder;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `800 ${isStory ? 18 : 15}px ${sansFont}`;
      ctx.fillStyle = palette.textMuted;
      ctx.fillText(stat.label, sx + statW / 2, cursorY + statH * 0.27);

      ctx.font = `800 ${isStory ? 40 : 30}px ${sansFont}`;
      ctx.fillStyle = palette.textPrimary;
      ctx.fillText(stat.value, sx + statW / 2, cursorY + statH * 0.56);

      ctx.font = `600 ${isStory ? 19 : 15}px ${sansFont}`;
      ctx.fillStyle = palette.accentSoft;
      ctx.fillText(stat.unit, sx + statW / 2, cursorY + statH * 0.80);
    });

    cursorY += statH + (isStory ? 40 : 24);
  }

  // 8. Inspirational Doa/Quote (Story format only for balanced vertical rhythm)
  if (isStory) {
    const quoteH = 152;
    drawRoundedRect(ctx, padX, cursorY, contentWidth, quoteH, 28);
    ctx.fillStyle = palette.pillBg;
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 24px ${sansFont}`;
    ctx.fillStyle = palette.textSecondary;
    ctx.fillText(
      '“Sebaik-baik kalian adalah orang yang mempelajari',
      width / 2,
      cursorY + 52
    );
    ctx.fillText(
      'Al-Qur’an dan mengajarkannya.” — HR. Bukhari',
      width / 2,
      cursorY + 94
    );
  }

  // 9. Footer Branding
  const footerY = height - (isStory ? 115 : 68);
  ctx.strokeStyle = palette.footerDivider;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padX, footerY - (isStory ? 44 : 28));
  ctx.lineTo(width - padX, footerY - (isStory ? 44 : 28));
  ctx.stroke();

  const logoImg = await loadImageSafe('/icon_talaqids.png');
  const logoSize = isStory ? 52 : 40;
  const brandText = 'talaQids · Pendamping Anak Hafiz Sejak Dini';
  ctx.font = `700 ${isStory ? 26 : 21}px ${sansFont}`;
  const textW = ctx.measureText(brandText).width;
  const totalBrandW = logoSize + 16 + textW;
  const startX = (width - totalBrandW) / 2;

  if (logoImg) {
    ctx.save();
    drawRoundedRect(ctx, startX, footerY - logoSize / 2, logoSize, logoSize, 12);
    ctx.clip();
    ctx.drawImage(logoImg, startX, footerY - logoSize / 2, logoSize, logoSize);
    ctx.restore();
  } else {
    drawRoundedRect(ctx, startX, footerY - logoSize / 2, logoSize, logoSize, 12);
    ctx.fillStyle = palette.accent;
    ctx.fill();
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = palette.textSecondary;
  ctx.fillText(brandText, startX + logoSize + 16, footerY + 1);
}

export function buildShareCaption(payload: ShareProgressPayload): string {
  const juzMeta = getJuzMeta(payload.cycle.currentJuz);
  const childLabel = payload.showChildName ? payload.childName : 'si kecil';
  const durationText = formatDurationCompact(payload.totalListenMinutes);

  const lines = [
    `Bismillah, progres perjalanan Al-Qur'an ${childLabel} di talaQids ✨`,
    `📖 Sedang di Juz ${payload.cycle.currentJuz} (${juzMeta.nameTransliteration}) — Bulan ke-${payload.cycle.currentMonth}, Hari ${payload.cycle.dayInCurrentCycle}/30.`,
  ];

  if (payload.showStats) {
    lines.push(
      `🎧 ${payload.activeDaysCount} hari aktif · ${durationText} simak murottal · ${payload.totalCompletedPagesCount} halaman talaqqi Mushaf.`
    );
  }

  lines.push(
    '',
    'Semoga Allah mudahkan anak-anak kita menjadi generasi pencinta dan penghafal Al-Qur’an. Aamiin 🤲',
    '',
    '#talaQids #Metode30Juz #ParentingIslami #AnakHafizQuran'
  );

  return lines.join('\n');
}
