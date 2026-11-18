/**
 * widgetLayout.js
 * Centralized layout engine and collision detection for Desktop Widgets and Icons.
 */

export const WIDGET_DIMENSIONS = {
  calendar:         { width: 170, height: 170 },
  dsaFocus:         { width: 163, height: 118 },
  status:           { width: 163, height: 118 },
  githubActivity:   { width: 450, height: 165 },
  leetcodeActivity: { width: 450, height: 165 },
  spotlight:        { width: 540, height: 50  },
};

export const MENU_BAR_HEIGHT = 32;
export const DOCK_HEIGHT     = 88;

/**
 * Computes non-overlapping default positions for all widgets.
 *
 * Left column stacking (gap = 10px between each):
 *   y=48           → githubActivity   (165px tall)
 *   y=48+165+10    → dsaFocus+status  (118px tall)  [twin row]
 *   y=48+165+10+118+10 → leetcodeActivity (165px tall)
 *
 * Total left-column height used = 48 + 165 + 10 + 118 + 10 + 165 = 516px
 * On a 900px screen: 900 - 88(dock) - 32(menubar) = 780px usable → fits fine.
 *
 * Calendar: top-right, below menu bar.
 * Spotlight: centered horizontally, vertically in the open middle space.
 */
export function computeDefaultWidgetPositions(vw = 1440, vh = 900) {
  const LEFT_X  = 16;
  const START_Y = MENU_BAR_HEIGHT + 16;      // 48px from top
  const GAP     = 10;

  const ghY   = START_Y;                            // githubActivity y
  const twinY = ghY + WIDGET_DIMENSIONS.githubActivity.height + GAP;   // dsaFocus/status y
  const lcY   = twinY + WIDGET_DIMENSIONS.dsaFocus.height + GAP;       // leetcodeActivity y

  // Spotlight: center of screen, vertically between twin row and leetcode
  const spotlightW = WIDGET_DIMENSIONS.spotlight.width;
  const spotX = Math.max(LEFT_X + WIDGET_DIMENSIONS.githubActivity.width + 20,
    Math.round((vw - spotlightW) / 2));

  // Vertically centre spotlight in the gap between twin-row bottom and lc-top
  const twinBottom = twinY + WIDGET_DIMENSIONS.dsaFocus.height;
  const spotY = Math.round(twinBottom + (lcY - twinBottom - WIDGET_DIMENSIONS.spotlight.height) / 2);

  // Calendar: top-right, leaving ~110px for desktop icons
  const calX = Math.max(LEFT_X + WIDGET_DIMENSIONS.githubActivity.width + 20, vw - 110 - WIDGET_DIMENSIONS.calendar.width - 12);

  return {
    githubActivity:   { x: LEFT_X, y: ghY   },
    dsaFocus:         { x: LEFT_X, y: twinY },
    status:           { x: LEFT_X + WIDGET_DIMENSIONS.dsaFocus.width + GAP, y: twinY },
    leetcodeActivity: { x: LEFT_X, y: lcY   },
    calendar:         { x: calX,  y: START_Y },
    spotlight:        { x: spotX, y: Math.max(spotY, twinY + 10) },
  };
}

/**
 * Checks if two bounding rectangles overlap.
 */
export function checkRectCollision(r1, r2, padding = 4) {
  return !(
    r1.x + r1.w + padding <= r2.x ||
    r1.x >= r2.x + r2.w + padding ||
    r1.y + r1.h + padding <= r2.y ||
    r1.y >= r2.y + r2.h + padding
  );
}

/**
 * Resolves desktop icon positions so they never collide with widgets.
 */
export function resolveDesktopIconPositions(vw, vh, widgetPositions, desktopAppIds) {
  const rightX = Math.max(vw - 110, 750);
  const occupiedRects = [];

  Object.entries(widgetPositions).forEach(([id, pos]) => {
    const dim = WIDGET_DIMENSIONS[id] || { width: 180, height: 140 };
    occupiedRects.push({ id, x: pos.x, y: pos.y, w: dim.width, h: dim.height });
  });

  const finalIconPositions = {};
  const iconW = 90;
  const iconH = 90;
  const initialYList = [60, 190, 320, 450, 580];

  desktopAppIds.forEach((appId, index) => {
    let targetX = rightX;
    let targetY = initialYList[index % initialYList.length];

    let hasCollision = occupiedRects.some((r) =>
      checkRectCollision({ x: targetX, y: targetY, w: iconW, h: iconH }, r)
    );

    if (hasCollision) {
      outer: for (let col = rightX; col >= 200; col -= 100) {
        for (let row = 60; row <= vh - DOCK_HEIGHT - 90; row += 120) {
          const testRect = { x: col, y: row, w: iconW, h: iconH };
          if (!occupiedRects.some((r) => checkRectCollision(testRect, r))) {
            targetX = col;
            targetY = row;
            break outer;
          }
        }
      }
    }

    finalIconPositions[appId] = { x: targetX, y: targetY };
    occupiedRects.push({ id: `icon-${appId}`, x: targetX, y: targetY, w: iconW, h: iconH });
  });

  return finalIconPositions;
}
