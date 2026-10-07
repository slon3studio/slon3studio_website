# slon3studio – spletna stran

Uradna spletna stran studia slon3studio: kdo smo, aplikacije, ki jih
izdelujemo, njihove strani za podporo in zasebnost ter obrazec za nove projekte.

## Namen

### Kdo smo

slon3studio je samostojni studio za razvoj aplikacij, ki ga vodi Ivo Peterka.
Izdelujemo preproste, uporabne aplikacije za iPhone in Mac, predvsem z
SwiftUI in Applovimi ogrodji, ter večplatformne aplikacije za iOS, Android in
splet. Pri vsaki aplikaciji pazimo na zasebnost, podporo pa nudi kar razvijalec,
ki jo je naredil.

Aplikacije razvijamo tudi po naročilu za posameznike in manjša podjetja.

### Naši produkti

| Aplikacija | Kaj dela | Platforme |
| --- | --- | --- |
| **Remote Mouse** | iPhone spremeni v brezžično sledilno ploščico in tipkovnico za Mac. | iOS, macOS |
| **PayDay** | Beleži izmene, napitnine in plačo pri več službah ter pokaže, koliko bo izplačilo ta mesec. | iOS |
| **Rotera** | Urnik izmen za vsako ekipo: vodja sestavi teden, zaposleni pošljejo želje, menjave in zamenjave izmen gredo vodji v potrditev. | iOS, Android, splet |
| **Slippy** | Kalkulator za natakarje in blagajnike: s kamero prebere znesek na kartičnih slipih in jih ob koncu izmene sešteje. | iOS |

### Kaj počne ta stran

Stran ima tri naloge:

- **Predstavi studio in aplikacije.** Vsaka aplikacija ima kartico na Domov in
  Aplikacije ter svojo stran s pregledom funkcij.
- **Služi App Store zahtevam.** Vsaka aplikacija ima svojo stran za podporo
  (Support) in politiko zasebnosti (Privacy Policy), ki ju App Store zahteva.
  Če se naslov katere od njiju spremeni, ga posodobi tudi v App Store Connect.
- **Pridobi nove naročnike.** Obrazec »Work with us« odpre e-poštni program
  obiskovalca z že izpolnjenim sporočilom za slon3studio@gmail.com.

Vsebina strani je v angleščini.

## Funkcije

- Domača stran s kartico za vsako aplikacijo
- Stran Aplikacije, O nas in Kontakt z obrazcem »Work with us«
- Za vsako aplikacijo: Pregled, Podpora in Zasebnost
- Temna tema, prilagojena telefonom, tablicam in računalnikom
- Brez ogrodja in brez koraka za gradnjo: čisti HTML, CSS in JavaScript

## Zagon in dostop

**V živo:** <https://slon3studio.github.io/slon3studio_website/>
(domena **slon3studio.si** se nastavlja, glej [Objava](#objava)).

**Lokalno:** strani lahko odpreš kar z dvoklikom na `index.html`, vendar je
bolje zagnati preprost strežnik, da delujejo vse povezave:

```bash
python3 -m http.server 8090
```

Nato odpri <http://localhost:8090>. Namestitev ni potrebna.

## Struktura

```
index.html            Domov
style.css             ves videz strani (barve so na vrhu, v :root)
script.js             meni na telefonu, animacije ob drsenju, obrazec
assets/               logotip in ikone aplikacij (<Ime>Icon-256.png)
pages/
  projects.html       Aplikacije
  about_us.html       O nas
  contact.html        Kontakt in obrazec »Work with us«
  <Aplikacija>/       ena mapa na aplikacijo
    <Aplikacija>.html Pregled
    SupportPage.html  Podpora
    PrivacyPolicy.html Zasebnost
```

Mapa `pages/MouseController/` je stran aplikacije **Remote Mouse** (staro ime).
Če jo preimenuješ, posodobi tudi povezave v App Store Connect.

## Tehnologije

- HTML, CSS in JavaScript brez knjižnic
- Pisavi Inter in Silkscreen (Google Fonts)
- Gostovanje na GitHub Pages

## Objava

Stran se objavi sama: vsak push na vejo `main` GitHub Pages objavi v nekaj
minutah. Drugega koraka ni.

**Lastna domena (slon3studio.si):** v nastavitvah repozitorija
(*Settings → Pages → Custom domain*) vpiši `slon3studio.si`, kar v repozitorij
doda datoteko `CNAME`. Pri ponudniku domene nastavi DNS zapise, ki jih navaja
[GitHub](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site),
in ko domena deluje, vklopi *Enforce HTTPS*.

**Predpomnjenje:** GitHub Pages brskalnikom dovoli, da CSS in slike hranijo do
10 minut. Zato ima vsaka stran `style.css?v=2`. Ko spremeniš `style.css`,
povečaj številko na vseh straneh. Ko zamenjaš sliko, ji daj novo ime.

## Pogosta opravila

**Dodaj aplikacijo:**

1. Ikono shrani kot `assets/<Ime>Icon-256.png` (256 × 256).
2. Kopiraj mapo obstoječe aplikacije (npr. `pages/Slippy/`) v
   `pages/<Ime>/`, preimenuj glavno datoteko in zamenjaj besedilo.
3. Dodaj kartico na `index.html` in `pages/projects.html` pred kartico
   »More apps on the way«.
4. Trditve na straneh Podpora in Zasebnost preveri v kodi aplikacije: kaj
   shranjuje, kam pošilja podatke in katera dovoljenja uporablja.

**Spremeni barve ali pisave:** spremenljivke na vrhu `style.css`.

## Kontakt

slon3studio@gmail.com · Ivo Peterka
