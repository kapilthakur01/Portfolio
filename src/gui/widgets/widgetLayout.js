/**
 * widgetLayout.js
 * Centralized layout engine and collision detection for Desktop Widgets and Icons.
 */

export const WIDGET_DIMENSIONS = {
  calendar:        { width: 170,  height: 170  },
  dsaFocus:        { width: 163,  height: 124  },
  status:          { width: 163,  height: 124  },
  githubActivity:  { width: 460,  height: 190  },
  leetcodeActivity:{ width: 460,  height: 190  },
  spotlight:       { width: 540,  height: 50   },
};

export const MENU_BAR_HEIGHT = 32;
export const DOCK_HEIGHT = 88;

/**
 * Computes non-overlapping default positions for all widgets and spotlight.
 * Layout matches the reference image:
 *   - githubActivity: top-left
 *   - dsaFocus + status: mid-left (twin row)
 *   - leetcodeActivity: bottom-left
 *   - calendar: top-right (near desktop icons)
 *   - spotlight: horizontal center
 */
export function computeDefaultWidgetPositions(vw = 1440, vh = 900) {
  const leftX = 16;

  // Spotlight centered horizontally
  const spotlightW = 540;
  let spotX = Math.round((vw - spotlightW) / 2);
  if (spotX < 200) spotX = 200;

  // Calendar sits top-right, leaving room for desktop icons (~100px wide)
  const calendarX = Math.max(vw - 110 - 170 - 16, vw - 300);

  return {
    githubActivity:   { x: leftX, y: 48 },
    dsaFocus:         { x: leftX, y: 48 + 190 + 12 },
    status:           { x: leftX + 163 + 14, y: 48 + 190 + 12 },
    leetcodeActivity: { x: leftX, y: 48 + 190 + 12 + 124 + 12 },
    calendar:         { x: calendarX, y: 48 },
    spotlight:        { x: spotX, y: Math.round((vh - DOCK_HEIGHT) / 2 - 25) },
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
 * Resolves desktop icon positions so they never collide with widgets or spotlight.
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

    const assigned = { x: targetX, y: targetY };
    finalIconPositions[appId] = assigned;
    occupiedRects.push({ id: `icon-${appId}`, x: targetX, y: targetY, w: iconW, h: iconH });
  });

  return finalIconPositions;
}
