"""Renders Sputnik 1 for the landing. Run: python3 tools/sputnik.py index.html

Sputnik 1: a 58 cm polished sphere of two hemispheres joined by a flange with 36 bolts; four whip antennas on the front
hemisphere in two pairs (2.4 m and 2.9 m), each swept back 35 degrees from the flight axis, so a pair spans 70.

The craft is ray traced (orthographic, pure Python, about a minute) into assets/img/sputnik.png: the hull is a mirror,
so it shows what's around it in orbit, black sky with the sun's glint up top and the sunlit Earth, clouds and a hazy
horizon below; the flange is a raised band with domed bolt heads; the rods and their mount fittings are polished too.
The SVG keeps the radio beep as vector rings and places the picture in the same 440 x 340 view box as before.
"""
import math, re, struct, sys, zlib, os

R = 33.0                      # sphere radius in view-box units
PX_PER_M = 2 * R / 0.58
MOUNT_POLAR = 60.0            # mounts: degrees from the nose; a rod swept back 35 degrees clears the hull only from 55 on
SWEEP = 35.0                  # each antenna's angle to the backward axis
ROLL = 30.0                   # roll about the axis, so no two antennas overlap in this view
LENGTHS = [2.4, 2.9, 2.4, 2.9]  # opposite antennas pair up
AZ, EL = 16.0, 12.0           # flight axis: up-right on screen, tilted toward the viewer
VBW, VBH, MARGIN = 440, 340, 14
K = 3                         # pixels per view-box unit (the box shows up to ~1.5x, so this holds on 2x screens)
ROD_R0, ROD_R1 = 0.62, 0.42   # rod radius at the root and the tip (about 1 cm)
FIT_R, FIT_L = 1.55, 4.2      # the mount fittings the rods leave from


def norm(v):
    l = math.sqrt(sum(c * c for c in v)); return tuple(c / l for c in v)
def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
def dot(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
def add(*vs):
    return tuple(sum(c) for c in zip(*vs))
def mul(v, k):
    return tuple(c * k for c in v)
def clamp(x, lo=0.0, hi=1.0):
    return lo if x < lo else hi if x > hi else x
def smooth(a, b, x):
    t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t)


az, el = math.radians(AZ), math.radians(EL)
a = norm((math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el)))   # x right, y up, z to viewer
u = norm(cross(a, (0, 0, 1))); v = cross(a, u)

def radial(phi):
    return add(mul(u, math.cos(phi)), mul(v, math.sin(phi)))

ants = []
mp = math.radians(MOUNT_POLAR); sw = math.radians(SWEEP)
for k in range(4):
    phi = math.radians(ROLL + 90 * k)
    m = mul(add(mul(a, math.cos(mp)), mul(radial(phi), math.sin(mp))), R)
    d = norm(add(mul(a, -math.cos(sw)), mul(radial(phi), math.sin(sw))))
    ants.append((m, d, LENGTHS[k] * PX_PER_M))

# ---------- the surroundings the metal reflects ----------
V = (0.0, 0.0, 1.0)
SUN = norm((-0.45, 0.72, 0.53))
EARTH = norm((0.12, -0.85, -0.2))      # toward the Earth's centre: below us, a little behind
EARTH_R = math.sin(math.radians(72))   # low orbit: the Earth fills a 144-degree cone

def _h(i, j, k):
    n = (i * 374761393 + j * 668265263 + k * 1274126177) & 0xFFFFFFFF
    n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((n ^ (n >> 16)) & 0xFFFF) / 65535.0

def vnoise(x, y, z):
    i, j, k = math.floor(x), math.floor(y), math.floor(z)
    fx, fy, fz = x - i, y - j, z - k
    fx, fy, fz = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy), fz * fz * (3 - 2 * fz)
    def L(p, q, t): return p + (q - p) * t
    return L(L(L(_h(i, j, k), _h(i + 1, j, k), fx), L(_h(i, j + 1, k), _h(i + 1, j + 1, k), fx), fy),
             L(L(_h(i, j, k + 1), _h(i + 1, j, k + 1), fx), L(_h(i, j + 1, k + 1), _h(i + 1, j + 1, k + 1), fx), fy), fz)

def fbm(p, oct=5):
    s, amp, f = 0.0, 0.5, 1.0
    for _ in range(oct):
        s += amp * vnoise(p[0] * f, p[1] * f, p[2] * f); amp *= 0.5; f *= 2.03
    return s / 0.97

def env(r):
    """Radiance seen along unit direction r (linear, roughly 0..1, the sun far brighter)."""
    out = [0.004, 0.004, 0.005]                         # black sky
    cs = dot(r, SUN)
    ang = math.acos(clamp(cs, -1, 1))
    sun = 40.0 * smooth(0.035, 0.02, ang) + 1.4 * math.exp(-ang / 0.06) + 0.05 * math.exp(-ang / 0.5)
    # the Earth: a sphere of radius EARTH_R at unit distance along EARTH
    b = dot(r, EARTH); disc = b * b - (1 - EARTH_R * EARTH_R)
    if disc > 0 and b > 0:
        t = b - math.sqrt(disc)
        hit = mul(r, t); n = mul(add(hit, mul(EARTH, -1)), 1 / EARTH_R)
        lit = max(0.0, dot(n, SUN))
        p = mul(n, 5.5)
        land = smooth(0.56, 0.6, fbm(add(mul(n, 1.7), (7.1, 3.3, 9.2)), 4))
        warp = fbm(add(p, (1.3, 8.7, 2.1)), 3)
        cloud = smooth(0.4, 0.62, fbm(add(mul(p, 1.0 + 0.4 * warp), (warp * 2, 0, 0))))
        alb = [0.035 + land * 0.12, 0.04 + land * 0.095, 0.05 + land * 0.07]   # deep slate seas, warm dry land
        alb = [c * (1 - cloud) + 0.78 * cloud for c in alb]
        grazing = 1 - clamp(-dot(n, r))                   # near the limb we look through more air
        haze = 0.5 * grazing ** 5
        rad = [0.85 * (c + haze * 0.55) * (lit * 0.95 + 0.03) for c in alb]
        edge = smooth(0.0, 0.004, disc)                  # soften the horizon a little
        out = [o * (1 - edge) + q * edge for o, q in zip(out, rad)]
        sun *= 1 - edge
    else:
        # the thin bright line of air just above the horizon
        gap = -disc if b > 0 else 1
        out = [o + 0.22 * math.exp(-gap / 0.006) * max(0.2, dot(r, SUN) + 0.6) for o in out]
    return [o + sun for o in out]

def reflect(n):
    k = 2 * dot(n, V)
    return (k * n[0] - V[0], k * n[1] - V[1], k * n[2] - V[2])

METAL = (0.9, 0.9, 0.88)          # polished aluminium alloy, a touch warm

def shade(n, gloss=1.0, ambient=0.0):
    e = env(reflect(n))
    diff = 0.022 * max(0.0, dot(n, SUN)) + ambient
    return [METAL[i] * e[i] * gloss + diff for i in range(3)]

def tone(c):
    out = []
    for x in c:
        x = 1 - math.exp(-x * 2.4)
        out.append(round(255 * (x ** (1 / 2.2))))
    return out

# ---------- fit, as the vector version did ----------
tip = lambda m, d, L: add(m, mul(d, L))
xs = [p[0] for m, d, L in ants for p in (m, tip(m, d, L))] + [-R, R]
ys = [-p[1] for m, d, L in ants for p in (m, tip(m, d, L))] + [-R, R]
ox = MARGIN - min(xs) + ((VBW - 2 * MARGIN) - (max(xs) - min(xs))) / 2
oy = MARGIN - min(ys) + ((VBH - 2 * MARGIN) - (max(ys) - min(ys))) / 2
f = lambda n: f"{n:.1f}"

# picture bounds in view-box units, then in pixels
pad = 3
bx0 = math.floor(ox + min(xs) - pad); bx1 = math.ceil(ox + max(xs) + pad)
by0 = math.floor(oy + min(ys) - pad); by1 = math.ceil(oy + max(ys) + pad)
W, H = (bx1 - bx0) * K, (by1 - by0) * K
frags = {}                         # pixel index -> [(depth, rgb, alpha)]

def put(ix, iy, z, rgb, al):
    if al <= 0.002: return
    frags.setdefault(iy * W + ix, []).append((z, rgb, al))

def to_model(ix, iy, sx=0.5, sy=0.5):   # pixel (+ sub-pixel offset) -> model x, y
    X = bx0 + (ix + sx) / K; Y = by0 + (iy + sy) / K
    return X - ox, oy - Y

# ---------- the hull ----------
BOLT_R = 0.75
FL_W = 1.15                         # half-width of the flange band
def hull(x, y):
    rr = x * x + y * y
    if rr >= R * R: return None
    nz = math.sqrt(R * R - rr)
    n = (x / R, y / R, nz / R)
    t = dot(n, a) * R                # distance along the axis from the seam
    gloss = 1.0
    if abs(t) < FL_W + 0.35:
        rad = norm(add(n, mul(a, -dot(n, a))))   # the band faces straight out
        if abs(t) < FL_W:
            n = norm(add(mul(rad, 0.85), mul(n, 0.15))); gloss = 0.82
            phi = math.atan2(dot(rad, v), dot(rad, u))
            dphi = (phi / math.radians(10) + 0.5) % 1 - 0.5
            bd = math.hypot(dphi * math.radians(10) * R, t)
            if bd < BOLT_R:          # a domed bolt head
                s = bd / BOLT_R
                bp = norm(add(mul(rad, dphi * math.radians(10) * R), mul(a, t)))
                n = norm(add(mul(rad, math.sqrt(1 - s * s)), mul(bp, s * 0.9)))
                gloss = 0.7 * (1 - 0.5 * smooth(0.75, 1.0, s))
        else:
            gloss = 0.25             # the shadowed groove where the band meets the hull
    return n, nz, gloss

for iy in range(H):
    for ix in range(W):
        x, y = to_model(ix, iy)
        rho = math.hypot(x, y)
        cov = clamp((R - rho) * K + 0.5)
        if cov <= 0: continue
        acc = [0.0, 0.0, 0.0]; cnt = 0
        for sx in (0.25, 0.75):
            for sy in (0.25, 0.75):
                xx, yy = to_model(ix, iy, sx, sy)
                h = hull(xx, yy)
                if h is None:
                    sc = (R - 0.01) / math.hypot(xx, yy); h = hull(xx * sc, yy * sc)
                c = shade(h[0], h[2])
                acc = [p + q for p, q in zip(acc, c)]; cnt += 1
        put(ix, iy, math.sqrt(max(0.0, R * R - rho * rho)), tone([c / cnt for c in acc]), cov)

# ---------- rods and their fittings: polished cylinders ----------
def cylinder(base, d, length, r0, r1, ambient):
    e1 = cross(d, (0, 0, 1)); l1 = math.hypot(e1[0], e1[1]); e1 = (e1[0] / l1, e1[1] / l1, 0.0)
    e2 = norm(cross(e1, d))
    if e2[2] < 0: e2 = mul(e2, -1)
    d2 = (d[0], d[1]); dd = d2[0] ** 2 + d2[1] ** 2
    end = add(base, mul(d, length))
    rmax = max(r0, r1) + 1
    px0 = int((min(base[0], end[0]) + ox - rmax - bx0) * K); px1 = int((max(base[0], end[0]) + ox + rmax - bx0) * K) + 1
    py0 = int((oy - max(base[1], end[1]) - rmax - by0) * K); py1 = int((oy - min(base[1], end[1]) + rmax - by0) * K) + 1
    for iy in range(max(0, py0), min(H, py1)):
        for ix in range(max(0, px0), min(W, px1)):
            x, y = to_model(ix, iy)
            wx, wy = x - base[0], y - base[1]
            t = (wx * d2[0] + wy * d2[1]) / dd           # along the axis (model units of d)
            tt = clamp(t, 0, length)
            r = r0 + (r1 - r0) * tt / length
            sd = wx * e1[0] + wy * e1[1]                 # signed distance across, on screen
            cov = clamp((r - abs(sd)) * K + 0.5)
            if t < 0 or t > length:                     # rounded ends
                cov *= clamp((r - abs(t - tt) * math.sqrt(dd)) * K + 0.5)
            if cov <= 0: continue
            s = clamp(sd / r, -0.999, 0.999); c = math.sqrt(1 - s * s)
            n = add(mul(e1, s), mul(e2, c))
            z = base[2] + d[2] * tt + r * c * e2[2]
            put(ix, iy, z, tone(shade(n, 1.0, ambient)), cov)

for m, d, L in ants:
    cylinder(add(m, mul(d, -1.2)), d, FIT_L, FIT_R, FIT_R * 0.8, 0.02)
    cylinder(m, d, L, ROD_R0, ROD_R1, 0.06)          # a little lift so the thin rods hold up on the dark page

# ---------- composite and write ----------
rows = []
for iy in range(H):
    row = bytearray([0])
    for ix in range(W):
        fs = frags.get(iy * W + ix)
        if not fs: row += b"\0\0\0\0"; continue
        fs.sort(key=lambda q: q[0])
        cr = cg = cb = 0.0; ca = 0.0
        for z, rgb, al in fs:                          # far to near, "over"
            cr = rgb[0] * al + cr * (1 - al); cg = rgb[1] * al + cg * (1 - al); cb = rgb[2] * al + cb * (1 - al)
            ca = al + ca * (1 - al)
        if ca > 0: cr, cg, cb = cr / ca, cg / ca, cb / ca
        row += bytes((min(255, round(cr)), min(255, round(cg)), min(255, round(cb)), round(ca * 255)))
    rows.append(bytes(row))

def png(w, h, raw):
    def chunk(t, data): return struct.pack(">I", len(data)) + t + data + struct.pack(">I", zlib.crc32(t + data) & 0xFFFFFFFF)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)) + \
        chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")

root = os.path.dirname(os.path.abspath(sys.argv[1]))
os.makedirs(os.path.join(root, "assets/img"), exist_ok=True)
open(os.path.join(root, "assets/img/sputnik.png"), "wb").write(png(W, H, b"".join(rows)))
if len(sys.argv) > 2:                  # a preview on the page's ground
    bg = (7, 8, 12); prev = []
    for r in rows:
        o = bytearray([0])
        for i in range(1, len(r), 4):
            al = r[i + 3] / 255; o += bytes(round(r[i + c] * al + bg[c] * (1 - al)) for c in range(3)) + b"\xff"
        prev.append(bytes(o))
    open(sys.argv[2], "wb").write(png(W, H, b"".join(prev)))
    sx0 = int((ox - R * 1.3 - bx0) * K); sy0 = int((oy - R * 1.3 - by0) * K); sw = min(int(R * 2.6 * K), W - sx0, H - sy0)   # and the hull, close up
    open(sys.argv[2].replace(".png", "-hull.png"), "wb").write(png(sw, sw, b"".join(
        b"\0" + r[1 + sx0 * 4: 1 + (sx0 + sw) * 4] for r in prev[sy0:sy0 + sw])))

cx, cy = ox, oy
svg = f'''          <svg viewBox="0 0 {VBW} {VBH}" class="spk__svg">
            <g class="spk__float" style="transform-origin: {f(cx)}px {f(cy)}px">
              <circle class="spk__pulse" cx="{f(cx)}" cy="{f(cy)}" r="{f(R)}"/>
              <circle class="spk__pulse spk__pulse--2" cx="{f(cx)}" cy="{f(cy)}" r="{f(R)}"/>
              <image class="spk__img" href="assets/img/sputnik.png" x="{bx0}" y="{by0}" width="{bx1 - bx0}" height="{by1 - by0}"/>
            </g>
          </svg>
'''

path = sys.argv[1]
h = open(path).read()
new = re.sub(r'          <svg viewBox="0 0 440 340" class="spk__svg">.*?          </svg>\n', lambda _: svg, h, count=1, flags=re.S)
assert new != h or svg in h
open(path, "w").write(new)
print("center", f(cx), f(cy), "image", W, "x", H)
