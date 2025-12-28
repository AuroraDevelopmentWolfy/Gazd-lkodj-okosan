# 🎲 Gazdálkodj Okosan - Magyar Társasjáték

## 📖 Projekt Áttekintés

**Gazdálkodj Okosan** egy teljes értékű, magyar nyelvű társasjáték webalkalmazás, amit telefonon lehet játszani úgy, hogy a telefont átadjuk egymásnak.

### 🎯 Fő jellemzők
- 2-6 játékos támogatása
- 50 mezős játéktábla speciális hatásokkal
- Lakásvásárlás (egyszeri vagy részletfizetéssel)
- 7 féle bútor vásárolható
- 70 különböző szerencsekártya
- Teljes mobil optimalizáció
- Offline játszható (PWA support lehetséges)

## 🌐 URL-ek

### Online Játék (Sandbox)
**🎮 Játszd most:** https://3000-i79zpg512fh0h5eq1ujyj-18e660f9.sandbox.novita.ai

### GitHub Repository
**📂 Forráskód:** https://github.com/AuroraDevelopmentWolfy/Gazd-lkodj-okosan

### Cloudflare Pages (Éles verzió)
**⚠️ Megjegyzés:** A Cloudflare API kulcs beállítása szükséges a deployment-hez.
A Deploy tab-on konfiguráld a Cloudflare API kulcsot, majd futtasd:
```bash
npm run deploy:prod
```

## 🎮 Játékszabályok

### Játék célja
Legyen lakásod (teljesen kifizetve) + mind a 7 bútor + min. 300.000 Ft készpénz

### Játék kezdete
- **Kezdőpénz:** 100.000 Ft/játékos
- **Játékosok:** 2-6 fő
- **Színválasztás:** Indítás előtt minden játékos választ színt

### Mezők típusai

#### 🟢 START mező (0)
- **+40.000 Ft** minden áthaladásnál
- **HA részletes lakást vettél:** -20.000 Ft START levonás + havi részlet

#### 🏪 BOLT mezők (14, 27, 44)
- **Lakás vásárlás:**
  - Egyben: 700.000 Ft
  - Részlet 1: 300k előleg + 4×100k részlet
  - Részlet 2: 400k előleg + 4×75k részlet
- **Bútorok vásárlása** (csak lakás után):
  - 🍳 Konyha: 150.000 Ft
  - 🚿 Fürdő: 120.000 Ft
  - 🛏️ Háló: 180.000 Ft
  - 🛋️ Nappali: 200.000 Ft
  - 📺 TV: 100.000 Ft
  - 🧺 Mosógép: 80.000 Ft
  - 🧊 Hűtő: 90.000 Ft

#### 🃏 SZERENCSEKÁRTYA mezők (12, 25, 42)
- 70 különböző kártya
- Pozitív: +10k-tól +200k-ig
- Negatív: -5k-tól -50k-ig
- Speciális: Újradobás

#### ⚡ Speciális mezők
- **1. mező:** Ugrás a 18. mezőre
- **7., 33. mező:** Kimaradsz 1 körből
- **15. mező:** Vissza 3 mezőt
- **19. mező:** Dobj még egyszer!
- **24. mező:** Csak 6-ossal léphetsz (máskülönben visszalépsz)
- **30. mező:** Ugrás a 36. mezőre
- **39. mező:** Vissza 6 mezőt
- **48. mező:** Ugrás START-ra + START hatás

### Részletfizetés rendszere
Ha részletre veszed a lakást, minden START áthaladásnál:
1. Levonnak 20.000 Ft-ot (START levonás)
2. Levonják a havi részletet (100k vagy 75k)
3. 4 részlet után a lakás a tiéd!

## 🛠️ Technológiai Stack

- **Backend:** Hono (TypeScript)
- **Frontend:** Vanilla JavaScript + TailwindCSS
- **Deployment:** Cloudflare Pages
- **Hosting:** Cloudflare Workers (Edge)
- **Képgenerálás:** AI generált játékelemek

## 📦 Adatmodell

### Játékos (Player)
```javascript
{
  id: number,
  name: string,
  color: string,
  position: number (0-49),
  money: number,
  hasHouse: boolean,
  housePaymentType: 'full' | 'installment' | null,
  installmentsPaid: number (0-4),
  installmentAmount: number (100000 | 75000),
  furniture: string[], // 7 bútor ID-k
  monthsPassed: number
}
```

### Játékállapot (Game State)
```javascript
{
  players: Player[],
  currentPlayerIndex: number,
  phase: 'setup' | 'rolling' | 'moving' | 'action',
  diceValue: number,
  canRoll: boolean,
  skipTurns: { [playerIndex]: turnsToSkip }
}
```

## 🚀 Használati Útmutató

### Telepítés és Futtatás

#### 1. Függőségek telepítése
```bash
npm install
```

#### 2. Fejlesztői szerver indítása
```bash
# Build először
npm run build

# PM2-vel indítás (sandbox környezetben)
pm2 start ecosystem.config.cjs

# Vagy lokálisan
npm run dev
```

#### 3. Production build
```bash
npm run build
npm run preview
```

#### 4. Cloudflare Pages deployment
```bash
# Először konfiguráld a Cloudflare API kulcsot a Deploy tab-on
npm run deploy:prod
```

### Játék menete

1. **Indítás:**
   - Válaszd ki a játékosok számát (2-6)
   - Minden játékos választ színt
   - Kattints "Játék indítása" gombra

2. **Körök:**
   - A soron lévő játékos koppint a kockára
   - Automatikus léptetés és mezőhatás
   - Boltban vásárolhatsz (ha arra lépsz)
   - Kártyát húzol (ha kártyamezőre lépsz)
   - Speciális mezők automatikusan végrehajtódnak

3. **Győzelem:**
   - Lakás (teljesen kifizetve)
   - Mind a 7 bútor megvásárolva
   - Minimum 300.000 Ft készpénz

## 📱 Mobil Optimalizáció

- **Touch-friendly:** Nagy, könnyen kattintható elemek
- **Responsive:** Alkalmazkodik minden képernyőmérethez
- **Gyors betöltés:** Optimalizált képek és minimális JavaScript
- **Offline ready:** Minden asset lokálisan elérhető

## 🎨 Grafikai Elemek

Minden játékelem AI-generált:
- Játéktábla háttér
- 6 színű játékos bábu
- Kocka (animált)
- Lakás ikon
- 7 bútor ikon
- Szerencsekártya design
- Bolt ikon
- START mező design

## 📊 Játék Statisztikák

- **Mezők száma:** 50
- **Szerencsekártyák:** 70
- **Bútorok:** 7
- **Boltok:** 3
- **Kártyamezők:** 3
- **Speciális mezők:** 9

## 🔧 Fejlesztési Lehetőségek

### Jelenlegi funkciók ✅
- [x] 2-6 játékos
- [x] Teljes játéklogika
- [x] Lakásvásárlás (egyszeri + részlet)
- [x] Bútorvásárlás
- [x] 70 szerencsekártya
- [x] Minden speciális mező
- [x] Győzelmi feltétel ellenőrzése
- [x] Mobil optimalizáció
- [x] Animált kockadobás

### Tervezett fejlesztések 🚧
- [ ] Hangeffektek (kockadobás, pénz, vásárlás)
- [ ] Játék mentés/betöltés (localStorage)
- [ ] Játéktörténet megjelenítése
- [ ] Többnyelvű támogatás
- [ ] PWA support (offline játék)
- [ ] Online multiplayer
- [ ] AI ellenfelek
- [ ] Statisztikák és ranglisták

## 📄 Licensz

Ez a projekt szabadon használható és módosítható.

## 👥 Készítő

**AI Asszisztens** - Teljes játékfejlesztés és design

## 🎉 Köszönetnyilvánítás

- TailwindCSS - Styling framework
- Hono - Lightweight web framework
- Cloudflare Pages - Hosting platform
- AI képgeneráló - Játék grafika

---

**Verzió:** 1.0.0
**Utolsó frissítés:** 2025-12-28

**Játssz és gazdálkodj okosan! 🎲💰🏠**
