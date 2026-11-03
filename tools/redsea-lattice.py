"""Builds assets/js/redsea-lattice.js from references/red-sea-lattice-v0.html for the Red Sea demo's tree.

Keeps the lattice's structure, text, resolution criteria and cross-links, and drops what the page must not show
(leakage flags, driver bookkeeping). The reference carries no probabilities, so this adds illustrative ones: the
branches and the nodes the summary and report cite are set by hand (keep them in sync with assets/js/redsea.js);
everything else gets a stable pseudo-random figure near its parent's. Run: python3 tools/redsea-lattice.py
"""
import json, re, hashlib, math, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "references", "red-sea-lattice-v0.html")
OUT = os.path.join(ROOT, "assets", "js", "redsea-lattice.js")

# the branches under the question: short label, chance by 1 Oct, and whether it eases the disruption
BRANCH = {
    "n1": ("Attacks escalate and spread", 44, 0), "n2": ("Cape rerouting becomes entrenched", 58, 0),
    "n3": ("A ceasefire cools the attacks", 16, 1), "n4": ("Naval escorts restore confidence", 17, 1),
    "n5": ("Houthi missile and drone attacks", 62, 0), "n6": ("Sea mines in Bab el-Mandeb", 6, 0),
    "n7": ("Somali piracy returns", 19, 0), "n8": ("State navies clash or blockade", 5, 0),
    "n9": ("A grounded ship blocks Suez", 4, 0), "n10": ("Sabotage of canal infrastructure", 3, 0),
    "n11": ("Canal pilot or port strikes", 9, 0), "n12": ("War-risk insurance prices ships out", 55, 0),
    "n13": ("Cyberattacks on carriers or the canal", 12, 0), "n14": ("A spill or fire closes a lane", 5, 0),
    "n15": ("Coastal wars degrade port services", 24, 0), "n16": ("GPS jamming and spoofing", 34, 0),
    "n17": ("New sanctions or transit bans", 13, 0), "n18": ("Undersea cable cuts", 21, 0),
    "n19": ("Mandatory convoys slow traffic", 22, 0), "n20": ("Extreme weather narrows passages", 7, 0),
    "n115": ("Iran steps up backing for the Houthis", 39, 0), "n116": ("US-Iran confrontation escalates", 27, 0),
    "n117": ("Coalition patrols strengthen", 31, 1), "n118": ("The Gaza ceasefire holds", 14, 1),
    "n120": ("Houthis lay mines", 8, 0), "n121": ("Houthi boardings and hijackings", 11, 0),
    "n126": ("Egypt tightens canal rules", None, 0),
}
# nodes the summary and report cite (redsea.js EVENTS.node): chance and its weekly history
CITED = {"n21": 46, "n76": 41, "n79": 64, "n2569": 18, "n138": 21, "n27": 9, "n154": 6}
# and their short labels, worded as the summary words them
CITED_LABEL = {"n21": "Eight or more attacks or near-misses on merchant ships in a month, by 1 July",
               "n76": "War-risk insurance tops 1% of a ship's value per Red Sea transit",
               "n79": "MSC keeps every Asia-Europe service on the Cape route for two weeks or more",
               "n2569": "A Gaza truce brings Houthi attacks down within a month",
               "n138": "An undersea cable crossing the Red Sea is cut or damaged",
               "n27": "Suez Canal pilots strike, halting transits for 12 hours or more",
               "n154": "A naval mine is found or goes off in Red Sea lanes or port approaches"}

src = open(SRC).read().split("\n")
line = next(l for l in src if l.startswith("const D = "))
D = json.loads(line[line.index("{"):line.rindex("}") + 1])
N, E = D["nodes"], D["edges"]
by = {n["i"]: n for n in N}
kids = {}
for n in N:
    kids.setdefault(n["p"], []).append(n["i"])


def h(s):  # a stable number in [0, 1) per node
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16) / 0x100000000


DATE = r"\d{4}-\d{2}-\d{2}"
def short(t):
    s = t.strip()
    s = re.sub(rf"^(Between|From) {DATE} (and|to) {DATE}(,)?( at any time,)?\s*", "", s)
    s = re.sub(rf"^(In the period|During the period) (from )?{DATE} (to|through) {DATE}(,)?( compared with[^,]*,)?\s*", "", s)
    s = re.sub(rf"^(After {DATE} and )?by {DATE},\s*", "", s)
    s = re.sub(rf"^(On|After|By|At any time between) {DATE}( and {DATE})?(,)?( throughout the day,)?\s*", "", s)
    s = re.sub(rf"^At any time between {DATE} and {DATE},\s*", "", s)
    s = re.sub(r"^(at any time|evaluated at any time),?\s*", "", s, flags=re.I)
    s = re.sub(r",? \(?evaluated\b.*$", "", s)
    s = re.sub(r"^(Intensity|Geographic expansion|Sustained premium elevation|Naval intercept volume):\s*", "", s)
    s = re.sub(r"\s*\([^()]{18,}\)", "", s)  # long asides in brackets: examples, abbreviations
    s = re.sub(r",? (as (recorded|confirmed|reported|published|stated|shown|measured) (by|in)|according to)\b.*$", "", s)
    s = s.rstrip(" .;,")
    return s[:1].upper() + s[1:] if s else t


p, band = {}, {}
def assign(i, parent_p):
    n = by[i]
    if n["k"] == "root":
        pass
    elif i in BRANCH:
        p[i] = BRANCH[i][1]
    elif i in CITED:
        p[i] = CITED[i]
    elif n["r"] == "forecast":
        base = min(90, max(4, parent_p if parent_p is not None else 30)) / 100
        z = math.log(base / (1 - base)) + (h(i) - 0.5) * 2.6  # wander from the parent's chance in log-odds
        p[i] = int(round(min(95, max(2, 100 / (1 + math.exp(-z))))))
    if i in p and p[i] is not None:
        band[i] = 3 + int(h(i + "b") * 7)
    for c in kids.get(i, []):
        assign(c, p.get(i, parent_p))


root = next(n for n in N if n["k"] == "root")
assign(root["i"], None)

DEPTH = {}
def depth(i, d):
    DEPTH[i] = d
    for c in kids.get(i, []):
        depth(c, d + 1)
depth(root["i"], 0)

nodes = []
for n in N:
    i = n["i"]
    o = {"i": i, "p": n["p"], "k": n["k"], "r": n["r"], "t": n["t"]}
    if n["k"] == "root":
        o["t"] = D["meta"]["q"]
    if i in BRANCH:
        o["s"] = BRANCH[i][0]
        if BRANCH[i][2]:
            o["ease"] = 1
    elif i in CITED_LABEL:
        o["s"] = CITED_LABEL[i]
    elif n["k"] != "root":
        s = short(n["t"])
        if s != n["t"]:
            o["s"] = s
    if p.get(i) is not None:
        o["pr"] = p[i]
        o["bd"] = band[i]
    if "c" in n:
        c = n["c"]
        o["c"] = {k: c[k] for k in ("e", "dl", "et", "src") if c.get(k)}
    if n.get("b"):
        o["b"] = n["b"][0]  # d: from a retrieved document, m: from the model's own knowledge
    nodes.append(o)

edges = [[e["s"], e["t"], e["r"], e.get("g") or 0] for e in E]
meta = {"q": D["meta"]["q"], "asOf": D["meta"]["as_of"], "to": D["meta"]["window_end"], "nodes": len(nodes), "edges": len(edges)}
body = json.dumps({"meta": meta, "nodes": nodes, "edges": edges}, ensure_ascii=False, separators=(",", ":"))
with open(OUT, "w") as f:
    f.write("/* Generated by tools/redsea-lattice.py from references/red-sea-lattice-v0.html; don't edit by hand.\n"
            "   The Red Sea question's decomposition: nodes {i, p parent, k kind, r role, t text, s short label, pr chance %,\n"
            "   bd band +/- pts, c resolution criteria, ease (eases the disruption), b born from d(ocument) or m(odel)},\n"
            "   edges [source, target, relation, sign]. Probabilities are illustrative. */\n")
    f.write("window.LATTICE = " + body + ";\n")
print(OUT, os.path.getsize(OUT), "bytes,", len(nodes), "nodes,", len(edges), "edges")
