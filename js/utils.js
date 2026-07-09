export function hitRectangle(r1, r2) {
    const r1CenterX = r1.x + r1.width / 2;
    const r1CenterY = r1.y + r1.height / 2;
    const r2CenterX = r2.x + r2.width / 2;
    const r2CenterY = r2.y + r2.height / 2;

    const vx = r1CenterX - r2CenterX;
    const vy = r1CenterY - r2CenterY;

    const combinedHalfWidths = r1.width / 2 + r2.width / 2;
    const combinedHalfHeights = r1.height / 2 + r2.height / 2;

    return (Math.abs(vx) < combinedHalfWidths && Math.abs(vy) < combinedHalfHeights);
}