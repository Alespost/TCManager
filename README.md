# TCManager

Rozšíření pro webové prohlížeče k automatizované správě souhlasů se zpracováním osobních údajů.

Testování je prováděno primárně v prohlížeči Mozilla Firefox.

Autor: Aleš Postulka - xpostu03@stud.fit.vutbr.cz

## Instalace

### Mozilla Firefox

```shell
make firefox
```

Nabídka > Nástroje pro vývojáře > Vzdálené ladění > Tento Firefox > Načíst dočasný doplněk... > Zvolit
soubor `manifest.json`

### Google Chrome

```shell
make chrome
```

Nabídka > Další nástroje > Rozšíření > Zapnout režim pro vývojáře > Načíst nerozbalené > Zvolit adresář `src`

## Vytvoření balíčků k publikování

## Mozilla Firefox

```shell
make firefox-pack
```

## Google Chrome

```shell
make chrome-pack
```