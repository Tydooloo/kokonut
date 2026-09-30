export const TAU = Math.PI * 2;
export const clamp = (n, low, high) => Math.min(high, Math.max(low, n));
export const shortestAngle = angle => ((angle + Math.PI) % TAU + TAU) % TAU - Math.PI;
export const snapEase = t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

export function frontProject(phase, count = 4) {
  let front = 0;
  for (let i = 1; i < count; i++) {
    if (Math.cos(phase + i * TAU / count) > Math.cos(phase + front * TAU / count)) front = i;
  }
  return front;
}

// Each product gets a stationary reading interval, followed by a short quarter-turn.
// Time advances only while visible. Page scrolling is deliberately not an input.
export class OrbitMotion {
  constructor({phase = 0, dwell = 3.8, duration = .82, count = 4} = {}) {
    Object.assign(this, {phase, dwell, duration, count});
    this.remaining = dwell;
    this.transition = null;
  }
  touch() {
    this.transition = null;
    this.remaining = this.dwell;
  }
  move(delta) {
    this.touch();
    this.phase += delta;
  }
  release(velocity, now, animate = true) {
    const projected = this.phase + clamp(velocity, -2.4, 2.4) * .12;
    this.select(frontProject(projected, this.count), now, animate);
  }
  select(index, _now, animate = true) {
    this.touch();
    const destination = this.phase + shortestAngle(-index * TAU / this.count - this.phase);
    if (!animate || Math.abs(destination - this.phase) < .0001) this.phase = destination;
    else this.transition = {from: this.phase, to: destination, elapsed: 0, automatic: false};
  }
  update(dt, _now, {automatic = true, held = false, animate = true} = {}) {
    if (dt <= 0) return;
    // Consume the remainder at state boundaries for the same timing at any frame rate.
    let budget = dt;
    while (budget > 1e-9) {
      if (held && (!this.transition || this.transition.automatic)) return;
      if (this.transition) {
        const travel = this.transition;
        if (travel.automatic && !automatic) return;
        const used = Math.min(budget, this.duration - travel.elapsed);
        travel.elapsed = animate ? travel.elapsed + used : this.duration;
        const t = clamp(travel.elapsed / this.duration, 0, 1);
        this.phase = travel.from + (travel.to - travel.from) * snapEase(t);
        budget -= used;
        if (t >= 1 - 1e-9) {
          this.phase = travel.to;
          this.transition = null;
          this.remaining = this.dwell;
        } else return;
      } else {
        if (!automatic) return;
        const used = Math.min(budget, this.remaining);
        this.remaining -= used;
        budget -= used;
        if (this.remaining < 1e-9) {
          this.transition = {from: this.phase, to: this.phase - TAU / this.count, elapsed: 0, automatic: true};
        }
      }
    }
  }
}
