import os

roots = ["backend", "frontend/src"]
targets = []
for r in roots:
    for dp, dn, fn in os.walk(r):
        if "node_modules" in dp or "__pycache__" in dp or ".venv" in dp:
            continue
        for f in fn:
            if f.endswith((".py", ".js")):
                p = os.path.join(dp, f)
                try:
                    t = open(p, encoding="utf-8").read()
                except Exception:
                    continue
                if "<<<<<<< " in t and ">>>>>>> " in t:
                    targets.append(p)


def keep_ours(text):
    out = []
    mode = 0  # 0 normal, 1 ours, 2 theirs
    for line in text.split("\n"):
        if line.startswith("<<<<<<< "):
            mode = 1
            continue
        if line.startswith("=======") and mode in (1, 2):
            mode = 2
            continue
        if line.startswith(">>>>>>> "):
            mode = 0
            continue
        if mode == 2:
            continue
        out.append(line)
    return "\n".join(out)


for p in targets:
    t = open(p, encoding="utf-8").read()
    with open(p, "w", encoding="utf-8", newline="") as fh:
        fh.write(keep_ours(t))
    print("resolved(ours):", p)
print("total:", len(targets))
