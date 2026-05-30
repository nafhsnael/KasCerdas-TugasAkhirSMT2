from pathlib import Path
import re

path = Path(__file__).resolve().parent.parent / 'src' / 'pages' / 'DashboardMasyarakatPage.jsx'
text = path.read_text(encoding='utf-8')
pattern = re.compile(r"const saldoPemasukanBulanIniTermasukSaldoAwal = saldoPemasukanBulanIni \+ saldoAwalSebelumBulanIni")
replacement = "const fallbackInitialBalance = hasSaldoAwalTransaction\n    ? 0\n    : Number(walletSummary?.income ?? walletSummary?.current ?? 0)\n\n  const saldoPemasukanBulanIniTermasukSaldoAwal = saldoPemasukanBulanIni + saldoAwalSebelumBulanIni + fallbackInitialBalance"
new_text, count = pattern.subn(replacement, text, count=1)
if count == 0:
    raise RuntimeError('Pattern not found in DashboardMasyarakatPage.jsx')
path.write_text(new_text, encoding='utf-8')
print('updated')
