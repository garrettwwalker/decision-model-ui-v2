"""Projects a 3D model of Sputnik 1 into the landing's SVG. Run: python3 tools/sputnik.py index.html

Sputnik 1: a 58 cm polished sphere of two hemispheres joined by a flange with 36 bolts; four whip antennas on the
front hemisphere in two pairs (2.4 m and 2.9 m), each swept back 35 degrees from the flight axis, so a pair spans 70.
"""
import math, re, sys

R = 33.0                      # sphere radius in px
PX_PER_M = 2 * R / 0.58
MOUNT_POLAR = 60.0            # mounts: degrees from the nose; a rod swept back 35 degrees clears the hull only from 55 on
SWEEP = 35.0                  # each antenna's angle to the backward axis
ROLL = 30.0                   # roll about the axis, so no two antennas overlap in this view
LENGTHS = [2.4, 2.9, 2.4, 2.9]  # opposite antennas pair up
AZ, EL = 16.0, 12.0           # flight axis: up-right on screen, tilted toward the viewer
VBW, VBH, MARGIN = 440, 340, 14


def norm(v):
    l = math.sqrt(sum(c * c for c in v)); return tuple(c / l for c in v)
def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
def add(*vs):
    return tuple(sum(c) for c in zip(*vs))
def mul(v, k):
    return tuple(c * k for c in v)


az, el = math.radians(AZ), math.radians(EL)
a = norm((math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el)))   # x right, y up, z to viewer
u = norm(cross(a, (0, 0, 1))); v = cross(a, u)

def radial(phi):
    return add(mul(u, math.cos(phi)), mul(v, math.sin(phi)))

def hidden(p):   # behind the sphere, as seen from +z
    r2 = p[0] ** 2 + p[1] ** 2
    return r2 < R * R and p[2] < math.sqrt(R * R - r2)

ants = []
mp = math.radians(MOUNT_POLAR); sw = math.radians(SWEEP)
for k in range(4):
    phi = math.radians(ROLL + 90 * k)
    m = mul(add(mul(a, math.cos(mp)), mul(radial(phi), math.sin(mp))), R)
    d = add(mul(a, -math.cos(sw)), mul(radial(phi), math.sin(sw)))
    L = LENGTHS[k] * PX_PER_M
    pts = [add(m, mul(d, L * i / 240)) for i in range(241)]
    ants.append((m, pts))

# fit: place the sphere so the whole drawing sits inside the view box
xs = [p[0] for _, pts in ants for p in pts] + [-R, R]
ys = [-p[1] for _, pts in ants for p in pts] + [-R, R]
ox = MARGIN - min(xs) + ((VBW - 2 * MARGIN) - (max(xs) - min(xs))) / 2
oy = MARGIN - min(ys) + ((VBH - 2 * MARGIN) - (max(ys) - min(ys))) / 2
S = lambda p: (ox + p[0], oy - p[1])
f = lambda n: f"{n:.1f}"

def runs(pts):
    out, cur = [], []
    for p in pts:
        if hidden(p):
            if len(cur) > 1: out.append(cur)
            cur = []
        else: cur.append(p)
    if len(cur) > 1: out.append(cur)
    return " ".join(f"M{f(S(r[0])[0])} {f(S(r[0])[1])}L{f(S(r[-1])[0])} {f(S(r[-1])[1])}" for r in out)

# far antennas go under the ball, which hides them exactly at its edge; near ones go over it, clipped where hidden
line = lambda pts: f"M{f(S(pts[0])[0])} {f(S(pts[0])[1])}L{f(S(pts[-1])[0])} {f(S(pts[-1])[1])}"
back_d = " ".join(line(pts) for m, pts in ants if m[2] <= 0)
front_d = " ".join(runs(pts) for m, pts in ants if m[2] > 0)
sockets = "".join(f'<circle class="spk__socket" cx="{f(S(m)[0])}" cy="{f(S(m)[1])}" r="1.8"/>' for m, _ in ants if m[2] > 0)

# the flange: a great circle at right angles to the flight axis, front half only; 36 bolts on it
ring = [mul(radial(math.radians(t)), R) for t in range(0, 361, 3)]
seg, segs = [], []
for p in ring:
    if p[2] > 0: seg.append(p)
    else:
        if len(seg) > 1: segs.append(seg)
        seg = []
if len(seg) > 1: segs.append(seg)
seam_d = " ".join("M" + " L".join(f"{f(S(p)[0])} {f(S(p)[1])}" for p in s) for s in segs)
bolts = "".join(f'<circle class="spk__bolt" cx="{f(S(p)[0])}" cy="{f(S(p)[1])}" r="0.7"/>'
                for p in (mul(radial(math.radians(10 * k)), R * 1.005) for k in range(36)) if p[2] > R * 0.08)

cx, cy = S((0, 0, 0))
rim = lambda deg: (cx + (R - 1) * math.cos(math.radians(deg)), cy + (R - 1) * math.sin(math.radians(deg)))
(r1x, r1y), (r2x, r2y) = rim(95), rim(205)

svg = f'''          <svg viewBox="0 0 {VBW} {VBH}" class="spk__svg">
            <defs>
              <radialGradient id="daybreak-chrome" cx="0.34" cy="0.28" r="0.74">
                <stop offset="0" stop-color="#ffffff"/><stop offset="0.08" stop-color="#f1f3f6"/><stop offset="0.34" stop-color="#a9afbb"/><stop offset="0.64" stop-color="#525865"/><stop offset="0.9" stop-color="#2c3039"/><stop offset="1" stop-color="#23262e"/>
              </radialGradient>
              <linearGradient id="daybreak-rimlight" gradientUnits="userSpaceOnUse" x1="{f(r1x)}" y1="{f(r1y)}" x2="{f(r2x)}" y2="{f(r2y)}">
                <stop offset="0" stop-color="#ffb070" stop-opacity="0"/><stop offset="0.45" stop-color="#ffb070"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <g class="spk__float" style="transform-origin: {f(cx)}px {f(cy)}px">
              <circle class="spk__pulse" cx="{f(cx)}" cy="{f(cy)}" r="{f(R)}"/>
              <circle class="spk__pulse spk__pulse--2" cx="{f(cx)}" cy="{f(cy)}" r="{f(R)}"/>
              <path class="spk__ant" d="{back_d}"/>
              <circle class="spk__ball" cx="{f(cx)}" cy="{f(cy)}" r="{f(R)}"/>
              <path class="spk__rim" d="M{f(r1x)} {f(r1y)}A{f(R - 1)} {f(R - 1)} 0 0 1 {f(r2x)} {f(r2y)}"/>
              <path class="spk__seam" d="{seam_d}"/>
              {bolts}
              <path class="spk__ant" d="{front_d}"/>
              {sockets}
            </g>
          </svg>
'''

path = sys.argv[1]
h = open(path).read()
new = re.sub(r'          <svg viewBox="0 0 440 340" class="spk__svg">.*?          </svg>\n', lambda _: svg, h, count=1, flags=re.S)
assert new != h
open(path, "w").write(new)
print("center", f(cx), f(cy), "antenna px", [round(L * PX_PER_M) for L in LENGTHS])
