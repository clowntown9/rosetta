#!/usr/bin/env python3
"""Generate STL files of playing-card suits for the Onshape "Mirror Challenge".

For each suit (heart, spade, club, diamond) this writes:
  stl/<suit>-half.stl  - the left half, flat edge on the mirror line (x = 0)
  stl/<suit>-full.stl  - the finished, mirrored suit (answer key)

Shapes are 50 mm tall and extruded 3 mm thick. Pure Python, no dependencies:
    python3 card-suits/generate_stls.py
"""
import math
import os
import struct

THICKNESS = 3.0  # mm
SEGMENTS = 48     # points per arc / curve


# ---------- 2D path helpers ----------

def arc(cx, cy, r, a0, a1, n=SEGMENTS):
    """Points along a circle from angle a0 to a1 (degrees), inclusive."""
    return [
        (cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
         cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n)))
        for i in range(n + 1)
    ]


def bezier(p0, p1, p2, n=SEGMENTS):
    """Quadratic Bezier curve from p0 to p2 with control point p1."""
    pts = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        pts.append((u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
                    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]))
    return pts


def join(*parts):
    """Concatenate point lists, dropping near-duplicate joints."""
    out = []
    for part in parts:
        for p in part:
            if not out or math.dist(out[-1], p) > 1e-6:
                out.append(p)
    return out


def tangent_angle(px, py, cx, cy, r, side):
    """Angle (deg) of the tangent point on circle (cx,cy,r) seen from (px,py).
    side=+1 / -1 picks which of the two tangents."""
    d = math.hypot(px - cx, py - cy)
    base = math.atan2(py - cy, px - cx)
    return math.degrees(base + side * math.acos(r / d))


def circle_axis_y(cx, cy, r, upper=True):
    """y where circle (cx,cy,r) crosses the mirror line x = 0."""
    h = math.sqrt(r * r - cx * cx)
    return cy + h if upper else cy - h


def circle_intersections(c1, r1, c2, r2):
    (x1, y1), (x2, y2) = c1, c2
    d = math.hypot(x2 - x1, y2 - y1)
    a = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
    h = math.sqrt(r1 * r1 - a * a)
    mx, my = x1 + a * (x2 - x1) / d, y1 + a * (y2 - y1) / d
    return [(mx + h * (y2 - y1) / d, my - h * (x2 - x1) / d),
            (mx - h * (y2 - y1) / d, my + h * (x2 - x1) / d)]


def angle_of(p, c):
    return math.degrees(math.atan2(p[1] - c[1], p[0] - c[0]))


# ---------- suit outlines ----------
# Each returns the LEFT half as an open path that starts and ends on x = 0.
# The closing edge of the half runs straight along the mirror line.

def heart():
    c, r = (-12.5, 36.0), 13.5
    notch_y = circle_axis_y(*c, r, upper=True)
    a_notch = angle_of((0, notch_y), c)
    a_tan = tangent_angle(0, 0, *c, r, side=-1)
    # notch -> over the top and left side of the lobe -> tangent point -> tip
    while a_tan < a_notch:
        a_tan += 360
    return join([(0, notch_y)], arc(*c, r, a_notch, a_tan), [(0, 0)])


def stem(start):
    """Flared spade/club stem from `start` down to the axis at y = 0."""
    return join(bezier(start, (-2.0, 5.0), (-9.0, 0.0)), [(0, 0)])


def spade():
    c, r = (-11.5, 24.0), 12.0
    top = (0, 50.0)
    a_tan = tangent_angle(*top, *c, r, side=+1)
    a_end = -50.0  # where the lobe hands off to the stem
    while a_end < a_tan:
        a_end += 360
    lobe = arc(*c, r, a_tan, a_end)
    return join([top], lobe, stem(lobe[-1]))


def club():
    top_c, top_r = (0, 37.0), 11.0
    side_c, side_r = (-12.0, 22.5), 11.0
    p = min(circle_intersections(top_c, top_r, side_c, side_r), key=lambda q: q[0])  # outer one
    a_top_start, a_top_end = 90.0, angle_of(p, top_c)
    while a_top_end < a_top_start:
        a_top_end += 360
    a_side_start = angle_of(p, side_c)
    a_side_end = -40.0
    while a_side_end < a_side_start:
        a_side_end += 360
    side = arc(*side_c, side_r, a_side_start, a_side_end)
    return join(arc(*top_c, top_r, a_top_start, a_top_end), side, stem(side[-1]))


def diamond():
    top, left, bottom = (0, 50.0), (-18.0, 25.0), (0, 0)
    return join(bezier(top, (-7.5, 36.0), left), bezier(left, (-7.5, 14.0), bottom))


SUITS = {"heart": heart, "spade": spade, "club": club, "diamond": diamond}


# ---------- polygon -> solid ----------

def signed_area(poly):
    return sum(poly[i][0] * poly[i - 1][1] - poly[i - 1][0] * poly[i][1]
               for i in range(len(poly))) / -2.0


def triangulate(poly):
    """Ear-clipping triangulation of a simple CCW polygon -> index triples."""
    idx = list(range(len(poly)))
    tris = []

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    def inside(p, a, b, c):
        return cross(a, b, p) >= 0 and cross(b, c, p) >= 0 and cross(c, a, p) >= 0

    guard = 0
    while len(idx) > 3:
        guard += 1
        if guard > 100000:
            raise RuntimeError("triangulation failed")
        for k in range(len(idx)):
            i0, i1, i2 = idx[k - 1], idx[k], idx[(k + 1) % len(idx)]
            a, b, c = poly[i0], poly[i1], poly[i2]
            if cross(a, b, c) <= 1e-12:
                continue  # reflex or degenerate
            if any(inside(poly[j], a, b, c) for j in idx if j not in (i0, i1, i2)):
                continue
            tris.append((i0, i1, i2))
            idx.pop(k)
            break
        else:
            raise RuntimeError("no ear found")
    tris.append(tuple(idx))
    return tris


def extrude(poly, h):
    if signed_area(poly) < 0:
        poly = poly[::-1]
    n = len(poly)
    bot = [(x, y, 0.0) for x, y in poly]
    top = [(x, y, h) for x, y in poly]
    facets = []
    for a, b, c in triangulate(poly):
        facets.append((top[a], top[b], top[c]))
        facets.append((bot[c], bot[b], bot[a]))
    for i in range(n):
        j = (i + 1) % n
        facets.append((bot[i], bot[j], top[j]))
        facets.append((bot[i], top[j], top[i]))
    return facets


def normal(a, b, c):
    u = [b[i] - a[i] for i in range(3)]
    v = [c[i] - a[i] for i in range(3)]
    n = (u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0])
    length = math.sqrt(sum(x * x for x in n)) or 1.0
    return tuple(x / length for x in n)


def write_stl(path, facets, name):
    with open(path, "wb") as f:
        f.write(name.encode()[:80].ljust(80, b" "))
        f.write(struct.pack("<I", len(facets)))
        for a, b, c in facets:
            f.write(struct.pack("<12fH", *normal(a, b, c), *a, *b, *c, 0))


def full_outline(half):
    """Mirror the left half across x = 0 to get the whole suit."""
    mirrored = [(-x, y) for x, y in reversed(half)]
    return half + mirrored[1:-1]


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, "stl")
    os.makedirs(out, exist_ok=True)
    for name, fn in SUITS.items():
        half = fn()
        for kind, poly in (("half", half), ("full", full_outline(half))):
            path = os.path.join(out, f"{name}-{kind}.stl")
            write_stl(path, extrude(poly, THICKNESS), f"{name} {kind} (mm)")
            print("wrote", os.path.relpath(path, here))


if __name__ == "__main__":
    main()
