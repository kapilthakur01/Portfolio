/**
 * widgetLayout.js — Centralized layout engine for Desktop Widgets.
 *
 * Activity widget exact height calculation:
 *   padding(12+10) + header(18+4) + stats(36+6) + monthRow(12+2) + grid(82+2) + legend(12+3)
 *   = 22 + 22 + 42 + 14 + 84 + 15 = 199 → 200px
 *
 * Left column stacking with 10px gaps (y starts at menubar+16 = 48):
 *   y=48           → githubActivity   200px
 *   y=258          → dsaFocus+status  118px  (twin row)
 *   y=386          → leetcodeActivity 200px
 *   bottom = 586   → dock starts at vh-88, so needs vh ≥ 674 (all 900px+ screens OK)
 */

export const WIDGET_DIMENSIONS = {
  calendar:         { width: 170, height: 170 },
  dsaFocus:         { width: 163, height: 118 },
  status:           { width: 163, height: 118 },
  githubActivity:   { width: 460, height: 200 },
  leetcodeActivity: { width: 460, height: 200 },
  spotlight:        { width: 540, height: 50  },
};

export const MENU_BAR_HEIGHT = 32;
export const DOCK_HEIGHT     = 88;

const LEFT_X  = 16;
const START_Y = MENU_BAR_HEIGHT + 16;   // 48
const GAP     = 10;

export function computeDefaultWidgetPositions(vw = 1440, vh = 900) {
  const ghH   = WIDGET_DIMENSIONS.githubActivity.height;    // 200
  const twinH = WIDGET_DIMENSIONS.dsaFocus.height;          // 118
  const lcH   = WIDGET_DIMENSIONS.leetcodeActivity.height;  // 200

  const ghY   = START_Y;                   // 48
  const twinY = ghY   + ghH   + GAP;      // 258
  const lcY   = twinY + twinH + GAP;      // 386

  // Spotlight: horizontally centred, sits in the open area right of DSA+Status
  const twinRightEdge = LEFT_X + WIDGET_DIMENSIONS.dsaFocus.width + GAP + WIDGET_DIMENSIONS.status.width;
  const spotlightW = WIDGET_DIMENSIONS.spotlight.width;

  // Try to place spotlight to the right of the twin row, vertically centred in that row
  let spotX = twinRightEdge + GAP + 10;
  let spotY = twinY + Math.round((twinH - WIDGET_DIMENSIONS.spotlight.height) / 2);

  // If it doesn't fit, center it horizontally
  if (spotX + spotlightW > vw - 120) {
    spotX = Math.round((vw - spotlightW) / 2);
    spotY = Math.round(twinY + (twinH - WIDGET_DIMENSIONS.spotlight.height) / 2);
  }

  // Calendar: top-right, leaving 110px for desktop icons
  const calX = Math.max(
    LEFT_X + WIDGET_DIMENSIONS.githubActivity.width + GAP,
    vw - 110 - WIDGET_DIMENSIONS.calendar.width - 12
  );

  return {
    githubActivity:   { x: LEFT_X, y: ghY   },
    dsaFocus:         { x: LEFT_X, y: twinY },
    status:           { x: LEFT_X + WIDGET_DIMENSIONS.dsaFocus.width + GAP, y: twinY },
    leetcodeActivity: { x: LEFT_X, y: lcY   },
    calendar:         { x: calX,  y: START_Y },
    spotlight:        { x: spotX, y: spotY  },
  };
}

export function checkRectCollision(r1, r2, padding = 4) {
  return !(
    r1.x + r1.w + padding <= r2.x ||
    r1.x >= r2.x + r2.w + padding ||
    r1.y + r1.h + padding <= r2.y ||
    r1.y >= r2.y + r2.h + padding
  );
}

export function resolveDesktopIconPositions(vw, vh, widgetPositions, desktopAppIds) {
  const rightX = Math.max(vw - 110, 750);
  const occupiedRects = [];

  Object.entries(widgetPositions).forEach(([id, pos]) => {
    const dim = WIDGET_DIMENSIONS[id] || { width: 180, height: 140 };
    occupiedRects.push({ id, x: pos.x, y: pos.y, w: dim.width, h: dim.height });
  });

  const iconW = 90, iconH = 90;
  const initialYList = [60, 190, 320, 450, 580];
  const finalIconPositions = {};

  desktopAppIds.forEach((appId, index) => {
    let tx = rightX;
    let ty = initialYList[index % initialYList.length];

    if (occupiedRects.some((r) => checkRectCollision({ x: tx, y: ty, w: iconW, h: iconH }, r))) {
      outer: for (let col = rightX; col >= 200; col -= 100) {
        for (let row = 60; row <= vh - DOCK_HEIGHT - 90; row += 120) {
          if (!occupiedRects.some((r) => checkRectCollision({ x: col, y: row, w: iconW, h: iconH }, r))) {
            tx = col; ty = row; break outer;
          }
        }
      }
    }

    finalIconPositions[appId] = { x: tx, y: ty };
    occupiedRects.push({ id: `icon-${appId}`, x: tx, y: ty, w: iconW, h: iconH });
  });

  return finalIconPositions;
}
