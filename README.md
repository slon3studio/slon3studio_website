<p align="center">
  <img src="assets/logo-256.png" alt="slon3studio logo" width="128" height="128" />
</p>

<h1 align="center">slon3studio</h1>

<p align="center">
  Majhen studio. Velike ideje.<br />
  Preproste, uporabne aplikacije za iPhone, Mac in splet.
</p>

<p align="center">
  <a href="https://slon3studio.si/"><b>Obišči spletno stran</b></a>
  &nbsp;·&nbsp;
  <a href="https://slon3studio.si/pages/projects">Aplikacije</a>
  &nbsp;·&nbsp;
  <a href="https://slon3studio.si/pages/contact#work">Pridobi ponudbo</a>
</p>

---

## O strani

To je uradna spletna stran studia slon3studio. Na njej:

- predstavimo studio in vse naše aplikacije,
- ima vsaka aplikacija svojo stran s pregledom, podporo (Support) in politiko
  zasebnosti (Privacy Policy),
- ima vsaka aplikacija svojo zgodbo »Kako je nastala« (`/pages/<App>/story`), ocene in mnenja iz App Stora ter video, kjer ga imamo,
- so na strani [Novice](https://slon3studio.si/pages/news) kratke objave za vsako izdano posodobitev,
- lahko stranke prek obrazca »Get a quote« (z izbiro paketa iz »Storitev«) pošljejo povpraševanje za ponudbo, obiskovalci pa se prijavijo na e-novice.

Stran je v angleščini (`/`) in slovenščini (`/sl/`). Gumb SL / EN v glavi preklaplja med jezikoma. Podpora in politika zasebnosti sta zaenkrat samo v angleščini.

## O studiu

slon3studio je samostojni studio za razvoj aplikacij iz Slovenije. Izdelujemo aplikacije za iPhone in Mac, predvsem s SwiftUI in
Applovimi ogrodji, ter spletne aplikacije.

- **Domače aplikacije:** narejene z Applovimi orodji, zato so hitre in se na napravi obnašajo, kot pričakuješ.
- **Zasebnost na prvem mestu:** zbiramo samo, kar aplikacija res potrebuje.
- **Prava podpora:** vprašanja gredo naravnost k razvijalcu, ki je aplikacijo
  naredil.

Aplikacije izdelujemo tudi po naročilu, za posameznike in manjša podjetja.

## Naši produkti

<table>
  <tr>
    <td width="96" align="center">
      <img src="assets/RemoteMouseIcon-256.png" alt="Mouse Controller" width="72" height="72" />
    </td>
    <td>
      <b><a href="https://slon3studio.si/pages/MouseController/">Mouse Controller</a></b> · <a href="https://apps.apple.com/si/app/mousecontroller/id6766896246">App Store</a> · <a href="https://apps.apple.com/si/app/mousecontroller/id6781235744?mt=12">Mac App Store</a><br />
      iPhone spremeni v brezžično sledilno ploščico in tipkovnico za Mac.<br />
      <sub>iOS · macOS · SwiftUI</sub>
    </td>
  </tr>
  <tr>
    <td width="96" align="center">
      <img src="assets/PayDayIcon-256.png" alt="PayDay" width="72" height="72" />
    </td>
    <td>
      <b><a href="https://slon3studio.si/pages/PayDay/">PayDay</a></b> · <a href="https://apps.apple.com/app/id6819828248">App Store</a><br />
      Beleži izmene, napitnine in plačo pri več službah ter pokaže, koliko bo izplačilo ta mesec.<br />
      <sub>iOS · SwiftUI · iCloud</sub>
    </td>
  </tr>
  <tr>
    <td width="96" align="center">
      <img src="assets/RoteraIcon-256.png" alt="Rotera" width="72" height="72" />
    </td>
    <td>
      <b><a href="https://slon3studio.si/pages/Rotera/">Rotera</a></b> · <a href="https://apps.apple.com/app/id6821974105">App Store</a><br />
      Urnik izmen za vsako ekipo: vodja sestavi teden, zaposleni pošljejo želje, menjave in zamenjave izmen pa gredo vodji v potrditev. Aplikacija za iPhone, za Android pa <a href="https://rotera.slon3studio.si">spletna aplikacija</a>.<br />
      <sub>iOS · spletna aplikacija</sub>
    </td>
  </tr>
  <tr>
    <td width="96" align="center">
      <img src="assets/SlippyIcon-256.png" alt="Slippy" width="72" height="72" />
    </td>
    <td>
      <b><a href="https://slon3studio.si/pages/Slippy/">Slippy</a></b> · <a href="https://apps.apple.com/app/id6821976978">App Store</a><br />
      Kalkulator za natakarje in blagajnike: s kamero prebere znesek na kartičnih slipih in jih ob koncu izmene sešteje.<br />
      <sub>iOS · SwiftUI · Vision</sub>
    </td>
  </tr>
  <tr>
    <td width="96" align="center">
      <img src="assets/TackaIcon-256.png" alt="Tačka" width="72" height="72" />
    </td>
    <td>
      <b><a href="https://slon3studio.si/pages/Tacka/">Tačka</a></b> · <a href="https://apps.apple.com/app/id6823619182">App Store</a><br />
      Poišči zaupanja vrednega sprehajalca psov ali varuha v bližini in spremljaj vsak sprehod v živo na zemljevidu.<br />
      <sub>iOS · SwiftUI · MapKit</sub>
    </td>
  </tr>
</table>

Nove aplikacije so že v delu.

## Dostop

- **Spletna stran:** <https://slon3studio.si/>
- **Lokalno:** v mapi zaženi `python3 -m http.server` in odpri <http://localhost:8000>. Povezave Home kažejo na mapo (`./`), zato jih strežnik odpre kot `index.html`. Povezave so brez `.html` (npr. `/pages/projects`), GitHub Pages pa jih sam poveže z datoteko. Pri lokalnem ogledu `script.js` končnico `.html` doda nazaj. Stari naslovi s `.html` (tudi tisti v App Storu) še vedno delujejo.

## Urejanje

- **Formspree (obrazec in e-novice):** na [formspree.io](https://formspree.io) ustvari dva obrazca, enega za povpraševanja in enega za e-novice, in njuna ID-ja (npr. `xyzabcde` iz `https://formspree.io/f/xyzabcde`) prilepi v `FORMSPREE` na vrhu `script.js`. Dokler je ID prazen, obrazec odpre aplikacijo za e-pošto, tako kot prej.
- **Nova objava v Novicah:** kopiraj en `<article class="post">` v `pages/news.html` in `sl/pages/news.html`, mu daj nov `id` in datum ter ga postavi na vrh. Piši samo o izdanih različicah (WhatsNew v mapi aplikacije).
- **Ocene:** povprečje in število ocen se na strani osvežita sama iz App Stora. Novo napisano mnenje dodaš ročno: v razdelku »Ratings & reviews« je predloga v komentarju. Mnenje prepiši dobesedno.
- **Video:** datoteko `<App>.mp4` (pokončna, H.264, do ~25 MB) in sliko `<App>-poster.jpg` daj v `assets/video/`, nato na strani aplikacije zamenjaj komentar `VIDEO SLOT` z blokom, ki je v njem.
- **Storitve in cene:** pregled paketov je v `pages/services.html`, vsak paket pa ima svojo stran v `pages/plans/<paket>.html` (in enako pod `sl/`). Cena je na obeh mestih. Gumb paketa odpre obrazec z že izbranim paketom (`contact?package=website#work`).
- **Akcija (npr. −50 %):** na vrhu `script.js` v `PROMO` nastavi `active: true` (in po želji `percent`). Vse cene paketov se prečrtajo, pokaže se nova cena in značka. Za konec akcije nastavi nazaj na `false`.
- **DDV:** pri cenah piše »DDV ni obračunan na podlagi 1. odstavka 94. člena ZDDV-1« (popoldanski s.p., ni zavezanec). Če postaneš zavezanec, to besedilo spremeni.
- **Slovenščina:** vsaka angleška stran ima slovensko dvojnico pod `/sl/` z enako potjo. Ko spremeniš eno, spremeni tudi drugo.

## Kontakt

<p>
  <a href="mailto:slon3studio@gmail.com">slon3studio@gmail.com</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/slon3studio">GitHub</a>
</p>
