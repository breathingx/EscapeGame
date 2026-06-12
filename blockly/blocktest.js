
// =================================================
// SETUP
// =================================================

import { movementLogic } from 'blockscript.js';

// Simple assertion function for testing
function assert(testName, actual, expected) {
    const isMatch = JSON.stringify(actual) === JSON.stringify(expected);
    if (isMatch) {
        console.log(`PASS: ${testName} | Output: ${JSON.stringify(actual)}`);
    } else {
        console.error(`FAIL: ${testName} | Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
    }
}

// =================================================
// TESTS FOR MOVEMENT LOGIC
// =================================================

console.log("programmeertests");

// --- All rotation ---
assert("Rotate Right from 0", movementLogic(0, 0, 0, "right"), { x: 0, y: 0, a: 90 });
assert("Rotate Left from 0", movementLogic(0, 0, 0, "left"), { x: 0, y: 0, a: -90 });

// --- All movement ---
assert("Move Forward at 0 deg (Right)", movementLogic(0, 0, 0, "forward"), { x: 1, y: 0, a: 0 });
assert("Move Forward at 90 deg (Down)", movementLogic(0, 0, 90, "forward"), { x: 0, y: 1, a: 90 });
assert("Move Forward at 180 deg (Left)", movementLogic(1, 0, 180, "forward"), { x: 0, y: 0, a: 180 });
assert("Move Forward at 270 deg (Up)", movementLogic(0, 1, 270, "forward"), { x: 0, y: 0, a: 270 });

// --- Boundaries ---
assert("Hit Right Wall (X=9)", movementLogic(9, 0, 0, "forward"), { x: 9, y: 0, a: 0 });
assert("Hit Top Wall (Y=0)", movementLogic(0, 0, 270, "forward"), { x: 0, y: 0, a: 270 });
assert("Hit Left Wall (X=0)", movementLogic(0, 0, 180, "forward"), { x: 0, y: 0, a: 180 });
assert("Hit Bottom Wall (Y=9)", movementLogic(0, 9, 90, "forward"), { x: 0, y: 9, a: 90 });

// --- overrotation ---
assert("Move Forward at -90 deg (Up)", movementLogic(0, 5, -90, "forward"), { x: 0, y: 4, a: -90 });
assert("Move Forward at 1440 deg (right)", movementLogic(0, 0, 1440, "forward"), { x: 1, y: 0, a: 1440 });