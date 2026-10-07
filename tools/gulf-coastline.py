# Regenerates the brief map coastline: python3 tools/gulf-coastline.py land-10m.json
# (land-10m.json from https://cdn.jsdelivr.net/npm/world-atlas@2/land-10m.json, Natural Earth, public domain)
# Decode Natural Earth land-10m TopoJSON, keep polygons near the Gulf, project like the brief map.
import json, sys
t = json.load(open(sys.argv[1]))
sx, sy = t["transform"]["scale"]; tx, ty = t["transform"]["translate"]
arcs = []
for a in t["arcs"]:
    x = y = 0; pts = []
    for dx, dy in a:
        x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)
def arc(i): return arcs[i] if i >= 0 else arcs[~i][::-1]
def ring(r):
    out = []
    for i in r:
        p = arc(i); out.extend(p if not out else p[1:])
    return out
LON0, LON1, LAT0, LAT1 = 44, 63, 19, 33
P = lambda lon, lat: ((lon - 47) * 46, (30.5 - lat) * 47)
d = []
for g in t["objects"]["land"]["geometries"]:
    polys = g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]
    for poly in polys:
        for r in poly:
            pts = ring(r)
            if not any(LON0 <= x <= LON1 and LAT0 <= y <= LAT1 for x, y in pts): continue
            # clamp far-away points into a padded box so huge continents stay small paths
            # project, then clamp to just outside the map's viewBox (70 105 540 255): off-map detail collapses
            BX0, BY0, BX1, BY1 = 60, 95, 620, 370
            pp = [(min(max(px, BX0), BX1), min(max(py, BY0), BY1)) for px, py in (P(x, y) for x, y in pts)]
            if all(px in (BX0, BX1) or py in (BY0, BY1) for px, py in pp): continue
            # drop points closer than 0.6px to the previous one
            keep = [pp[0]]
            for q in pp[1:]:
                if abs(q[0] - keep[-1][0]) + abs(q[1] - keep[-1][1]) > 0.35: keep.append(q)
            if len(keep) < 3: continue
            d.append("M" + " L".join("%.1f %.1f" % q for q in keep) + "Z")
print(" ".join(d))
