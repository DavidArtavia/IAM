# deploy_iis.py
import argparse
import os
import sys
import shutil
from datetime import datetime
from pathlib import Path
import fnmatch
import subprocess

DEFAULT_SRC = Path("dist")
DEFAULT_DEST = Path(r"C:\inetpub\wwwroot\IAMWEB_QA")

def eprint(*a): print(*a, file=sys.stderr)

def validate_paths(src: Path, dest: Path):
    if not src.exists() or not src.is_dir():
        eprint(f"ERROR: No existe la carpeta de origen: {src}")
        sys.exit(1)
    if not (src / "index.html").exists():
        eprint(f"ADVERTENCIA: {src}/index.html no existe. ¿Ejecutaste npm run build?")
    dest.parent.mkdir(parents=True, exist_ok=True)

def ts():
    return datetime.now().strftime("%Y%m%d_%H%M%S")

def backup_dest_dircopy(dest: Path, backup_root: Path) -> Path:
    backup_root.mkdir(parents=True, exist_ok=True)
    backup_dir = backup_root / f"{dest.name}_bak_{ts()}"
    print(f"Creando respaldo (copia de carpeta) en: {backup_dir}")
    shutil.copytree(dest, backup_dir)
    return backup_dir

def backup_dest_zip(dest: Path, backup_root: Path) -> Path:
    backup_root.mkdir(parents=True, exist_ok=True)
    zip_base = backup_root / f"{dest.name}_bak_{ts()}"
    zip_path = shutil.make_archive(str(zip_base), "zip", root_dir=dest)
    print(f"Creando respaldo ZIP en: {zip_path}")
    return Path(zip_path)

def copy_update(src: Path, dest: Path, excludes: list[str]):
    dest.mkdir(parents=True, exist_ok=True)
    for root, dirs, files in os.walk(src):
        rel = Path(root).relative_to(src)
        dest_root = dest / rel
        dest_root.mkdir(parents=True, exist_ok=True)
        dirs[:] = [d for d in dirs if not any(fnmatch.fnmatch(d, p) for p in excludes)]
        for f in files:
            if any(fnmatch.fnmatch(f, p) for p in excludes):
                continue
            s = Path(root) / f
            d = dest_root / f
            if not d.exists() or s.stat().st_mtime > d.stat().st_mtime or s.stat().st_size != d.stat().st_size:
                shutil.copy2(s, d)

def remove_extraneous(src: Path, dest: Path, excludes: list[str]):
    for root, dirs, files in os.walk(dest, topdown=False):
        rel = Path(root).relative_to(dest)
        src_root = src / rel
        for f in files:
            if any(fnmatch.fnmatch(f, p) for p in excludes):
                continue
            dfile = Path(root) / f
            sfile = src_root / f
            if not sfile.exists():
                dfile.unlink(missing_ok=True)
        for dname in dirs:
            if any(fnmatch.fnmatch(dname, p) for p in excludes):
                continue
            ddir = Path(root) / dname
            sdir = src_root / dname
            if not sdir.exists():
                shutil.rmtree(ddir, ignore_errors=True)

def run_robocopy(src: Path, dest: Path, mirror: bool):
    args = ["robocopy", str(src), str(dest)]
    args += ["/MIR" if mirror else "/E", "/R:1", "/W:1", "/NFL", "/NDL", "/NP", "/NJH", "/NJS", "/MT"]
    print("Ejecutando:", " ".join(args))
    rc = subprocess.call(args)
    if rc >= 8:
        raise RuntimeError(f"robocopy falló con código {rc}")
    else:
        print(f"robocopy completado (código {rc})")

def main():
    parser = argparse.ArgumentParser(description="Deploy de dist/ a IIS")
    parser.add_argument("--src", type=Path, default=DEFAULT_SRC, help="Carpeta origen (build). Ej: dist")
    parser.add_argument("--dest", type=Path, default=DEFAULT_DEST, help=r"Carpeta IIS destino. Ej: C:\inetpub\wwwroot\IAMWEB_QA")
    parser.add_argument("--mirror", action="store_true", help="Reflejar: borra archivos extra en destino")
    parser.add_argument("--backup", action="store_true", help="Crear respaldo del destino antes de copiar")
    parser.add_argument("--backup-dir", type=Path, default=None, help="Ruta donde guardar el backup (recomendado fuera de wwwroot)")
    parser.add_argument("--zip-backup", action="store_true", help="Hacer backup en ZIP (en lugar de carpeta)")
    parser.add_argument("--robocopy", action="store_true", help="Usar robocopy (Windows) para copiar")
    parser.add_argument("--exclude", action="append", default=[], help="Patrones a excluir. Ej: --exclude *.map")
    args = parser.parse_args()

    src = args.src.resolve()
    dest = args.dest.resolve()
    validate_paths(src, dest)

    if args.backup and dest.exists():
        try:
            backup_root = args.backup_dir.resolve() if args.backup_dir else dest.parent
            if args.zip_backup:
                backup_dest_zip(dest, backup_root)
            else:
                backup_dest_dircopy(dest, backup_root)
        except PermissionError as pe:
            eprint("✖ Sin permisos para crear el backup en:", backup_root)
            eprint("   Sugerencias: ejecuta como Administrador, usa --backup-dir fuera de C:\\inetpub,")
            eprint("   o asigna permisos de escritura a tu usuario.")
            sys.exit(2)

    try:
        if args.robocopy and os.name == "nt":
            run_robocopy(src, dest, args.mirror)
        else:
            copy_update(src, dest, args.exclude)
            if args.mirror:
                remove_extraneous(src, dest, args.exclude)
        print("✔ Deploy completado con éxito.")
        sys.exit(0)
    except PermissionError as pe:
        eprint("✖ Error de permisos al copiar. Ejecuta como Administrador o concede permisos NTFS.")
        sys.exit(2)
    except Exception as ex:
        eprint("✖ Error durante el deploy:", ex)
        sys.exit(2)

if __name__ == "__main__":
    main()


# py deploy_iis.py --mirror --backup --robocopy
#  py deploy_iis.py --mirror --backup --exclude *.config

# Se debe dar permisos al usuario que sale en el comando whoami a la arpeta de wwwroot para qeu funcione