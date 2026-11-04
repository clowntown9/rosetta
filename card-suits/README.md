# Card suit STLs – Onshape Mirror Challenge

STL files of the four playing-card suits for the "Mirror Challenge":
sketch half a suit, then use a construction line and the mirror tool to make the other half.

| File | What it is |
| --- | --- |
| `stl/heart-half.stl`, `stl/spade-half.stl`, `stl/club-half.stl`, `stl/diamond-half.stl` | Left half of each suit. The flat right edge is the mirror line. |
| `stl/heart-full.stl`, `stl/spade-full.stl`, `stl/club-full.stl`, `stl/diamond-full.stl` | The finished, mirrored suit (answer key). |

Every shape is **50 mm tall and 3 mm thick**. The mirror line is the Y axis (x = 0), with the bottom of the suit at the origin.

## Importing into Onshape

1. Download the `.stl` files you want (open the file on GitHub and click **Download raw file**).
2. In Onshape, either:
   - on the Documents page click **Create → Import files**, or
   - inside a document, click the **+** at the bottom-left → **Import…**
3. Pick the STL file(s). When asked for units, choose **Millimeter**.
4. The part shows up in the Part Studio (or as its own tab) and in the document's tab list, so you can find it by name, e.g. `heart-half`.

## Regenerating

The shapes are built by `generate_stls.py` (plain Python 3, no extra packages):

```sh
python3 card-suits/generate_stls.py
```

Change `THICKNESS` or the circle sizes in that file to make different versions.
