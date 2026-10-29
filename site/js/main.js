/* Gyógygödör Borozó, bemutató oldal, v5
   Sötét pince, egyetlen vékony sárgaréz vonal (a v3 kinézete), a v4 mozgásaival: billenő szakaszok, 3D folyosó a termekhez,
   asztalról felemelkedő tányérok. Csak transform és opacity mozog; görgetéshez kötve csak egérrel és valódi grafikus chippel, érintőn időzítve. Natív görgetés. */
(function () {
  'use strict';
  var D = document, root = D.documentElement;
  var mq = function (q) { return window.matchMedia && matchMedia(q).matches; };
  var canHover = mq('(hover: hover) and (pointer: fine)');
  var reduced = mq('(prefers-reduced-motion: reduce)');
  function $(s, c) { return (c || D).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || D).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 4); }

  /* ---------- Nyelvek (a magyar szöveg a HTML-ben van) ---------- */
  var DE = {
    'skip': 'Zum Inhalt springen', 'menu': 'Menü',
    'nav.cellar': 'Der Keller', 'nav.rooms': 'Räume', 'nav.menu': 'Speisekarte', 'nav.wine': 'Weine', 'nav.photos': 'Bilder', 'nav.contact': 'Kontakt',
    'hdr.call': 'Tisch reservieren', 'mbar.call': 'Tisch reservieren',
    'hero.h1': 'Kellerweinstube am Hauptplatz von Sopron', 'hero.book': 'Reservieren', 'hero.menu': 'Speisekarte', 'hero.addr': 'Fő tér 4',
    'pince.t': 'Der Keller',
    'pince.p1': 'Sie finden uns am Fő tér 4, im Keller des Kossow-Hauses. Von der Straße führt eine Treppe hinunter, am schmiedeeisernen Geländer mit den Weinranken entlang.',
    'pince.p2': 'Weinstube seit 1966. Damals waren es zwei Keller, später kamen die zwei Keller unter dem benachbarten Komitatshaus dazu. Heute sind es fast 300 Quadratmeter, drei Räume und 130 Plätze.',
    'pince.p3': 'Die gotische Steinarkade stammt aus dem späten 15. Jahrhundert, das Gewölbe bekam Ende des 17. Jahrhunderts seine heutige Form.',
    'pince.oldalt': 'Das Kossow-Haus am Hauptplatz im Jahr 1965, Schwarzweißfoto',
    'pince.oldcap': 'Das Kossow-Haus 1965, ein Jahr vor der Eröffnung der Weinstube. Foto: Fortepan / Zoltán Mészáros',
    'pince.alt': 'Das Schild der Gyógygödör über dem gewölbten Eingang, davor Geranien',
    'pince.cap': 'Der Eingang am Hauptplatz',
    'nev.t': 'Warum Gyógygödör?',
    'nev.p1': 'Gyógygödör heißt ungefähr „Heilgrube“. Auf der ersten Seite unserer Speisekarte steht:',
    'nev.q': '„Der Legende nach gingen alle, die zur Kur in die Lővér-Hügel nach Sopron kamen und in der Trinkstube einkehrten, die damals noch Pinceborozó hieß, geheilt wieder hinaus. Daher hat die Weinstube ihren heutigen Namen.“',
    'termek.t': 'Drei Räume', 'termek.p': 'Die Räume gehen ineinander über, von der Treppe nach hinten.',
    'r1.alt': 'Die Schank mit Stehtischen aus Weinfässern vor einer Bruchsteinwand', 'r1.t': 'Die Schank',
    'r1.d': 'Unten an der Treppe. Hier schenken wir den Wein aus, und wer nur auf einen Gespritzten kommt, kann an den Fässern stehen bleiben.',
    'r2.alt': 'Bänke und Tische aus Baumstämmen unter einem Steingewölbe, an der Rückwand die Figur der Gyógygödör', 'r2.t': 'Der Baumstammraum',
    'r2.d': 'Bänke und Tische, aus ganzen Baumstämmen geschnitzt. An der Rückwand hebt die Figur der Gyógygödör ihr Glas.',
    'r3.alt': 'Das Restaurant mit hellen Holzstühlen zwischen gewölbten Steinwänden', 'r3.t': 'Das Restaurant',
    'r3.d': 'Der größere Raum, für längere Mittag- und Abendessen. Dahinter liegt das Nebenzimmer für etwa 40 Personen.',
    'etlap.t': 'Speisekarte',
    'etlap.p': 'Einige Gerichte von unserer Karte vom Oktober 2026. Auf der ganzen Karte stehen auch Kindermenüs, Salate, Burger und vegetarische Platten.',
    'mg1': 'Suppen in der Tasse', 'mg2': 'Ungarische Häppchen', 'mg3': 'Aus dem Topf', 'mg4': 'Frisch gebraten', 'mg5': 'Platten', 'mg6': 'Desserts',
    'd1': 'Hausgemachte Fleischsuppe mit Leberknödel oder Nudeln', 'd2': 'Bohnengulasch in der Tasse',
    'd3': 'Hirntoast, 2 Scheiben', 'd4': 'Schmalzbrot mit roten Zwiebeln',
    'd5': 'Rindergulasch in Rotwein mit Nockerln', 'd6': 'Kuttelflecke mit frischem Brot', 'd7': 'Kuttelflecke mit Hirn und frischem Brot',
    'd8': 'Saures Beuschel mit Semmelknödel', 'd9': 'Gemischte Fischsuppe mit Karpfenfilet',
    'd10': 'Riesiges Schnitzel Wiener Art mit Käse, Sauerrahm und gemischter Beilage', 'd10t': 'Empfehlung der Küchenchefin',
    'd11': 'Schweineschnitzel mit Hirnfüllung und gemischter Beilage', 'd12': 'Zigeunerbraten mit Steakkartoffeln',
    'd13': 'Marinierter Schweinekamm vom Grill mit Pfeffersauce und Röstzwiebeln',
    'd14': 'Große Platte für 1–2 Personen', 'd15': 'Gyógygödör-Platte für 2–3 Personen', 'd16': 'Familien-Platte für 4–8 Personen',
    'd17': 'Hausgemachte Topfenknödel mit Erdbeersoße oder gesüßtem Sauerrahm', 'd18': 'Kastanienpüree mit Schlagsahne',
    'd19': 'Schokoladensoufflé, auch glutenfrei und vegan',
    'ph1.alt': 'Rindergulasch mit Nockerln, Foto eines Gastes', 'ph1.cap': 'Gulasch mit Nockerln',
    'ph2.alt': 'Hirntoast auf karierter Tischdecke, Foto eines Gastes', 'ph2.cap': 'Hirntoast',
    'etlap.note': 'Preise in Forint, auf die Rechnung kommen 10 % Servicegebühr. Eine kleine Portion kostet 70 % des Preises. Fragen Sie den Service nach Allergenen.',
    'etlap.pdf': 'Die ganze Speise- und Getränkekarte (PDF)', 'etlap.wolt': 'Bei Wolt bestellen',
    'borok.t': 'Weine', 'borok.p': 'In der Schank gibt es offenen Wein aus Sopron, der Preis gilt pro Liter.',
    'w1': 'Soproner Cuvée', 'w1d': 'weiß, halbsüß', 'w2': 'Grüner Veltliner', 'w2d': 'weiß, trocken', 'w3': 'Welschriesling', 'w3d': 'weiß, trocken',
    'w4': 'Blaufränkisch', 'w4d': 'rot, trocken', 'w5': 'Rosé', 'w5d': 'rosé, trocken', 'w6': 'Zweigelt', 'w6d': 'rot, halbsüß', 'w7': 'Cabernet Sauvignon', 'w7d': 'rot, trocken',
    'borok.unit': 'Forint pro Liter',
    'borok.more': 'Auch in der Flasche, zum Beispiel Prémium Furmint 2018 und Prémium Cabernet Sauvignon. Bier gibt es von Soproni und Óvatos Duhaj, Pálinka von Karikás und Palotás.',
    'borok.q': '„Ihr Wein kommt seit Jahrzehnten aus den besten Soproner Kellern, und es sind zwar keine »großen Weine«, aber gute.“',
    'borok.qs': 'Gast in einem Internetforum, zitiert auf gyogygodor.hu (übersetzt)',
    'kepek.t': 'Bilder',
    'k1.alt': 'Das Schild und der Eingang im verschneiten Winter', 'k1.cap': 'Der Eingang im Winter',
    'k2.alt': 'Topfenknödel mit Erdbeersoße', 'k2.cap': 'Topfenknödel mit Erdbeersoße',
    'k3.alt': 'Mittagessen an einem Holztisch auf dem Kopfsteinpflaster des Hauptplatzes', 'k3.cap': 'Mittagessen draußen am Hauptplatz',
    'k4.alt': 'Große Platte mit Panierten, Pommes und Reis auf karierter Tischdecke', 'k4.cap': 'Eine Platte auf der karierten Tischdecke',
    'vel.t': 'Bewertungen',
    'vel.q1': '„Selten ein Ort, an dem man nicht schief angeschaut wird, auch wenn man nur einen kleinen Gespritzten hinunterkippt.“', 'vel.s1': 'Gast in einem Internetforum (übersetzt)',
    'vel.q2': '„Hier habe ich zum ersten Mal in meinem Leben Kutteln gegessen.“', 'vel.s2': 'Aus dem Text eines Gastes, zitiert auf gyogygodor.hu (übersetzt)',
    'vel.q3': '„Sopron wäre ärmer ohne sie!“', 'vel.s3': 'Gast in einem Internetforum (übersetzt)',
    'vel.score': 'auf Google, mehr als 1.700 Bewertungen', 'vel.write': 'Bewertung schreiben',
    'tars.t': 'Für Gruppen',
    'tars.p1': 'Das Nebenzimmer reicht für etwa 40 Personen, größere Gruppen finden auch in den anderen Räumen Platz.',
    'tars.p2': 'Für Geburtstage und Firmenessen werden meist die Platten bestellt: die Gyógygödör-Platte für 2–3, die Familien-Platte für 4–8 Personen.',
    'info.t': 'Kontakt', 'info.where': 'Im Keller des Kossow-Hauses, an der Westecke des Hauptplatzes.', 'info.route': 'Route planen',
    'info.hours': 'Öffnungszeiten', 'info.good': 'Gut zu wissen',
    'day.1': 'Montag', 'day.2': 'Dienstag', 'day.3': 'Mittwoch', 'day.4': 'Donnerstag', 'day.5': 'Freitag', 'day.6': 'Samstag', 'day.0': 'Sonntag',
    'good.1': 'Tische reservieren Sie telefonisch.', 'good.2': 'In den Keller geht es über eine Treppe.', 'good.3': 'Unten ist der Handyempfang schwach.', 'good.4': 'Die Box zum Mitnehmen kostet 300 Forint.',
    'ft.tag': 'Weinstube und Restaurant seit 1966',
    'ft.note': 'Entwurf einer Website, nicht die offizielle Seite der Gyógygödör Borozó. Gerichte und Preise stammen von der Speisekarte vom Oktober 2026. Fotos: etterem.hu, funiq.hu, wanderlog, Tripadvisor (Gästefotos), Archivfoto: Fortepan / Zoltán Mészáros (CC BY-SA 3.0).'
  };
  var EN = {
    'skip': 'Skip to content', 'menu': 'Menu',
    'nav.cellar': 'The cellar', 'nav.rooms': 'Rooms', 'nav.menu': 'Menu', 'nav.wine': 'Wine', 'nav.photos': 'Photos', 'nav.contact': 'Contact',
    'hdr.call': 'Book a table', 'mbar.call': 'Book a table',
    'hero.h1': 'Cellar wine bar on Sopron’s main square', 'hero.book': 'Book a table', 'hero.menu': 'Menu', 'hero.addr': 'Fő tér 4',
    'pince.t': 'The cellar',
    'pince.p1': 'We are at Fő tér 4, in the cellar of the Kossow House. A flight of stairs leads down from the street, beside the wrought-iron railing with its vine leaves.',
    'pince.p2': 'A wine bar since 1966. It started with two cellars, and later the two cellars under the County Hall next door were added. Today it is almost 300 square metres, three rooms and 130 seats.',
    'pince.p3': 'The Gothic stone arcade dates from the late 1400s, and the vault took its present shape at the end of the 17th century.',
    'pince.oldalt': 'The Kossow House on the main square in 1965, black-and-white photo',
    'pince.oldcap': 'The Kossow House in 1965, a year before the wine bar opened. Photo: Fortepan / Zoltán Mészáros',
    'pince.alt': 'The Gyógygödör sign above the arched entrance, with geraniums',
    'pince.cap': 'The entrance on the main square',
    'nev.t': 'Why Gyógygödör?',
    'nev.p1': 'Gyógygödör means roughly “healing pit”. The first page of our menu says:',
    'nev.q': '“Legend has it that people who came to Sopron to seek a cure in the Lővér hills, and stopped at the drinking cellar then still called Pinceborozó, left it cured. That is where the wine bar’s name comes from.”',
    'termek.t': 'Three rooms', 'termek.p': 'The rooms open one into the next, from the stairs inwards.',
    'r1.alt': 'The bar, with standing tables made from wine barrels and a rubble-stone wall', 'r1.t': 'The bar',
    'r1.d': 'At the foot of the stairs. This is where we pour the wine, and if you only came for a spritzer you can stand at the barrels.',
    'r2.alt': 'Log benches and tables under a stone vault, with the Gyógygödör figure on the back wall', 'r2.t': 'The log room',
    'r2.d': 'Benches and tables carved from whole tree trunks. On the back wall, the Gyógygödör figure raises his glass.',
    'r3.alt': 'The restaurant, with light wooden chairs between arched stone walls', 'r3.t': 'The restaurant',
    'r3.d': 'The bigger room, for longer lunches and dinners. Behind it is the side room, which seats about 40.',
    'etlap.t': 'Menu',
    'etlap.p': 'A few dishes from our October 2026 menu. The full menu also has children’s meals, salads, burgers and vegetarian platters.',
    'mg1': 'Soup in a cup', 'mg2': 'Hungarian snacks', 'mg3': 'From the pot', 'mg4': 'Cooked to order', 'mg5': 'Platters', 'mg6': 'Desserts',
    'd1': 'Homemade meat soup with liver dumplings or noodles', 'd2': 'Bean goulash soup, cup',
    'd3': 'Brains on toast, 2 slices', 'd4': 'Bread and dripping with red onion',
    'd5': 'Beef stew in red wine with galuska dumplings', 'd6': 'Tripe stew with fresh bread', 'd7': 'Tripe stew with brains and fresh bread',
    'd8': 'Sour lung ragout with bread dumpling', 'd9': 'Mixed fish soup with carp fillet',
    'd10': 'Giant breaded pork chop with cheese, sour cream and mixed sides', 'd10t': 'The head chef’s pick',
    'd11': 'Breaded pork chop stuffed with brains, mixed sides', 'd12': 'Roast pork cutlet with garlic and spiced steak potatoes',
    'd13': 'Grilled marinated pork neck with pepper sauce and fried onions',
    'd14': 'Big platter for 1–2', 'd15': 'Gyógygödör platter for 2–3', 'd16': 'Family platter for 4–8',
    'd17': 'Homemade curd cheese dumplings with strawberry sauce or sweetened sour cream', 'd18': 'Chestnut purée with whipped cream',
    'd19': 'Chocolate soufflé, also gluten-free and vegan',
    'ph1.alt': 'Beef stew with galuska dumplings, a guest’s photo', 'ph1.cap': 'Beef stew with dumplings',
    'ph2.alt': 'Brains on toast on a checked tablecloth, a guest’s photo', 'ph2.cap': 'Brains on toast',
    'etlap.note': 'Prices are in forints, and a 10% service charge is added to the bill. A small portion costs 70% of the price. Ask your server about allergens.',
    'etlap.pdf': 'The full food and drinks menu (PDF)', 'etlap.wolt': 'Order on Wolt',
    'borok.t': 'Wine', 'borok.p': 'At the bar we pour Sopron wine from the barrel, priced by the litre.',
    'w1': 'Sopron blend', 'w1d': 'medium-sweet white', 'w2': 'Grüner Veltliner', 'w2d': 'dry white', 'w3': 'Olaszrizling', 'w3d': 'dry white',
    'w4': 'Kékfrankos', 'w4d': 'dry red', 'w5': 'Rosé', 'w5d': 'dry rosé', 'w6': 'Zweigelt', 'w6d': 'medium-sweet red', 'w7': 'Cabernet Sauvignon', 'w7d': 'dry red',
    'borok.unit': 'Forints per litre',
    'borok.more': 'There are bottles too, such as Prémium Furmint 2018 and Prémium Cabernet Sauvignon. Beer from Soproni and Óvatos Duhaj, pálinka from Karikás and Palotás.',
    'borok.q': '“For decades their wine has come from the best cellars in Sopron, and while they are not »great wines«, they are good.”',
    'borok.qs': 'A guest on an online forum, quoted on gyogygodor.hu (translated)',
    'kepek.t': 'Photos',
    'k1.alt': 'The sign and the entrance in the snow', 'k1.cap': 'The entrance in winter',
    'k2.alt': 'Curd cheese dumplings with strawberry sauce', 'k2.cap': 'Curd cheese dumplings with strawberry sauce',
    'k3.alt': 'Lunch on a wooden table on the cobbles of the main square', 'k3.cap': 'Lunch outside on the main square',
    'k4.alt': 'A big platter of breaded meats, chips and rice on a checked tablecloth', 'k4.cap': 'A platter on the checked tablecloth',
    'vel.t': 'Reviews',
    'vel.q1': '“A rare place where nobody looks down on you, even if you only came in to knock back a small spritzer.”', 'vel.s1': 'A guest on an online forum (translated)',
    'vel.q2': '“This is where I ate tripe for the first time in my life.”', 'vel.s2': 'From a guest’s piece, quoted on gyogygodor.hu (translated)',
    'vel.q3': '“Sopron would be poorer without it!”', 'vel.s3': 'A guest on an online forum (translated)',
    'vel.score': 'on Google, more than 1,700 reviews', 'vel.write': 'Write a review',
    'tars.t': 'Groups',
    'tars.p1': 'The side room holds about 40 people, and bigger groups fit in the other rooms too.',
    'tars.p2': 'For birthdays and work dinners people usually order the platters: the Gyógygödör platter is for 2–3, the family platter for 4–8.',
    'info.t': 'Contact', 'info.where': 'In the cellar of the Kossow House, on the west corner of the main square.', 'info.route': 'Directions',
    'info.hours': 'Opening hours', 'info.good': 'Good to know',
    'day.1': 'Monday', 'day.2': 'Tuesday', 'day.3': 'Wednesday', 'day.4': 'Thursday', 'day.5': 'Friday', 'day.6': 'Saturday', 'day.0': 'Sunday',
    'good.1': 'Tables are booked by phone.', 'good.2': 'The cellar is down a flight of stairs.', 'good.3': 'Phone signal is weak downstairs.', 'good.4': 'A takeaway box costs 300 forints.',
    'ft.tag': 'Wine bar and restaurant since 1966',
    'ft.note': 'Website concept, not the official site of Gyógygödör Borozó. Dishes and prices are from the October 2026 menu. Photos: etterem.hu, funiq.hu, wanderlog, Tripadvisor (guest photos), archive photo: Fortepan / Zoltán Mészáros (CC BY-SA 3.0).'
  };
  var UI = {
    hu: { today: 'Ma', open: 'Most nyitva, {t}-ig.', today2: 'Most zárva. Ma {t}-kor nyitunk.', tom: 'Most zárva. Holnap {t}-kor nyitunk.', sep: ' ', score: '4,5', call: 'Hívás: +36 99 311 280' },
    de: { today: 'Heute', open: 'Jetzt geöffnet, bis {t} Uhr.', today2: 'Jetzt geschlossen. Wir öffnen heute um {t} Uhr.', tom: 'Jetzt geschlossen. Wir öffnen morgen um {t} Uhr.', sep: '.', score: '4,5', call: 'Anrufen: +36 99 311 280' },
    en: { today: 'Today', open: 'Open now, until {t}.', today2: 'Closed now. We open today at {t}.', tom: 'Closed now. We open tomorrow at {t}.', sep: ',', score: '4.5', call: 'Call +36 99 311 280' }
  };

  Object.assign(DE, {
    'hero.since': 'seit 1966',
    'pince.alt2': 'Gewölbebogen aus Bruchstein und Holzstühle im Keller',
    'e1.alt': 'Bohnengulasch in der Tasse', 'e2.alt': 'Rindergulasch in Rotwein mit Nockerln',
    'e3.alt': 'Riesenschnitzel mit Käse und Sauerrahm', 'e3.cap': 'Riesenschnitzel',
    'e4.alt': 'Schokoladensoufflé mit Schlagsahne und Erdbeersoße', 'e4.cap': 'Schokoladensoufflé',
    'borok.alt': 'Treppe in den Keller mit schmiedeeisernem Geländer, unten Weinfässer',
    'k5.alt': 'Das beleuchtete Schild am Abend, vor dem Eingang Blumenkästen', 'k5.cap': 'Abends am Hauptplatz',
    'k6.alt': 'Der Hauptplatz von Sopron mit dem Feuerturm und der Dreifaltigkeitssäule', 'k6.cap': 'Der Hauptplatz mit dem Feuerturm',
    'tars.alt': 'Eine Gesellschaft beim Abendessen unter einem Gewölbebogen',
    'info.alt': 'Das Kossow-Haus am Hauptplatz, im Erdgeschoss das Schild der Gyógygödör', 'info.cap': 'Das Kossow-Haus, Fő tér 4',
    'ft.note': 'Entwurf einer Website, nicht die offizielle Seite der Gyógygödör Borozó. Gerichte und Preise stammen von der Speisekarte vom Oktober 2026. Fotos: etterem.hu, funiq.hu, wanderlog, Tripadvisor (Gästefotos), Wolt, gyogygodor.hu, Archivfoto: Fortepan / Zoltán Mészáros (CC BY-SA 3.0).'
  });
  Object.assign(EN, {
    'hero.since': 'since 1966',
    'pince.alt2': 'Rubble-stone arch and wooden chairs in the cellar',
    'e1.alt': 'Bean goulash soup in a cup', 'e2.alt': 'Beef stew in red wine with galuska dumplings',
    'e3.alt': 'Giant breaded pork chop with cheese and sour cream', 'e3.cap': 'Giant breaded pork chop',
    'e4.alt': 'Chocolate soufflé with whipped cream and strawberry sauce', 'e4.cap': 'Chocolate soufflé',
    'borok.alt': 'Stairs down into the cellar with a wrought-iron railing, wine barrels below',
    'k5.alt': 'The lit sign in the evening, flower boxes by the entrance', 'k5.cap': 'Evening on the main square',
    'k6.alt': 'Sopron’s main square with the Firewatch Tower and the Holy Trinity Column', 'k6.cap': 'The main square and the Firewatch Tower',
    'tars.alt': 'A group having dinner under a vaulted arch',
    'info.alt': 'The Kossow House on the main square, with the Gyógygödör sign on the ground floor', 'info.cap': 'The Kossow House, Fő tér 4',
    'ft.note': 'Website concept, not the official site of Gyógygödör Borozó. Dishes and prices are from the October 2026 menu. Photos: etterem.hu, funiq.hu, wanderlog, Tripadvisor (guest photos), Wolt, gyogygodor.hu, archive photo: Fortepan / Zoltán Mészáros (CC BY-SA 3.0).'
  });

  /* magyar szövegben nem törő szóköz az a/az névelő és az ezres tagolás után */
  function nb(s) { return s.replace(/(^|[\s(„])(a|az|A|Az) /g, '$1$2 ').replace(/(\d) (\d{3})/g, '$1 $2'); }

  var HU = {};
  var tEls = $$('[data-i18n]'), aEls = $$('[data-i18n-alt]');
  tEls.forEach(function (e) { var v = nb(e.textContent); e.textContent = v; HU[e.getAttribute('data-i18n')] = v; });
  aEls.forEach(function (e) { HU[e.getAttribute('data-i18n-alt')] = e.getAttribute('alt'); });
  var prices = $$('.mg li b, .wines b');
  prices.forEach(function (e) { e._v = e.textContent.replace(/\D/g, ''); });
  function fmtPrice(v, sep) { return v.length > 3 ? v.slice(0, -3) + sep + v.slice(-3) : v; }

  var lang = 'hu';
  function setLang(l) {
    lang = (l === 'de' || l === 'en') ? l : 'hu';
    var dict = lang === 'de' ? DE : lang === 'en' ? EN : HU;
    tEls.forEach(function (e) { var k = e.getAttribute('data-i18n'), v = dict[k] != null ? dict[k] : HU[k]; if (e.textContent !== v) e.textContent = v; });
    aEls.forEach(function (e) { var k = e.getAttribute('data-i18n-alt'); e.setAttribute('alt', dict[k] != null ? dict[k] : HU[k]); });
    prices.forEach(function (e) { e.textContent = fmtPrice(e._v, UI[lang].sep); });
    var sb = $('.score b'); if (sb) sb.textContent = UI[lang].score;
    var mc = $('.mcall'); if (mc) mc.setAttribute('aria-label', UI[lang].call);
    root.setAttribute('lang', lang);
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    try { localStorage.setItem('gyogygodor-lang', lang); } catch (e) {}
    hours();
  }
  function pickLang() {
    var q = /[?&]lang=(hu|de|en)/.exec(location.search);
    if (q) return q[1];
    try { var s = localStorage.getItem('gyogygodor-lang'); if (s) return s; } catch (e) {}
    var ls = navigator.languages || [navigator.language || 'hu'];
    for (var i = 0; i < ls.length; i++) { var c = String(ls[i]).slice(0, 2).toLowerCase(); if (c === 'hu' || c === 'de' || c === 'en') return c; }
    return 'en';
  }

  /* ---------- Nyitvatartás, budapesti idő (EU nyári időszámítás, Intl nélkül) ---------- */
  var HOURS = { 0: [11, 22], 1: [11, 22], 2: [11, 22], 3: [11, 22], 4: [11, 22], 5: [11, 23], 6: [11, 23] };
  function lastSunday(y, m) { var d = new Date(Date.UTC(y, m + 1, 0, 1)); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d.getTime(); }
  function budapest() {
    var t = Date.now(), y = new Date(t).getUTCFullYear();
    var dst = t >= lastSunday(y, 2) && t < lastSunday(y, 9);
    var b = new Date(t + (dst ? 2 : 1) * 3600000);
    return { d: b.getUTCDay(), h: b.getUTCHours() + b.getUTCMinutes() / 60 };
  }
  function hh(h) { return (h < 10 ? '0' : '') + h + ':00'; }
  function hours() {
    var n = budapest(), o = HOURS[n.d], u = UI[lang], msg;
    $$('.hours tr').forEach(function (tr) { tr.classList.toggle('today', +tr.getAttribute('data-d') === n.d); });
    var td = $('.js-today'); if (td) td.textContent = u.today + ' ' + hh(o[0]) + '–' + hh(o[1]);
    if (n.h >= o[0] && n.h < o[1]) msg = u.open.replace('{t}', hh(o[1]));
    else if (n.h < o[0]) msg = u.today2.replace('{t}', hh(o[0]));
    else msg = u.tom.replace('{t}', hh(HOURS[(n.d + 1) % 7][0]));
    var nw = $('.js-now'); if (nw) nw.textContent = msg;
  }

  setLang(pickLang());
  setInterval(hours, 60000);


  /* ---------- Képességek ---------- */
  var gpu = (function () {
    try {
      var c = D.createElement('canvas'), g = c.getContext('webgl');
      if (!g) return 'none';
      var ext = g.getExtension('WEBGL_debug_renderer_info');
      var r = ext ? String(g.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
      var lose = g.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
      return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(r) ? 'soft' : 'hw';
    } catch (e) { return 'none'; }
  })();
  var touch = !canHover;
  var rich = canHover && !reduced && gpu === 'hw';
  if (gpu === 'hw') root.classList.add('is-grain');
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function eio(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function px(v) { return v.toFixed(1) + 'px'; }
  // oldalbeli helyzet a transzformációk nélkül (egy éppen billenő szakaszban se mérjünk ferdén)
  function absTop(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }
  var vw = innerWidth, vh = innerHeight;

  /* ---------- Fejléc, menü, hívósáv ---------- */
  var hdr = $('#hdr'), hero = $('.hero'), heroIn = $('.hero__in'), mcall = $('.mcall'), burger = $('.hdr__burger'), mnav = $('#mnav');
  var heroVisible = true;
  function chrome() {
    var past = scrollY > hero.offsetHeight - 80;
    hdr.classList.toggle('is-solid', past || !mnav.hidden);
    mcall.classList.toggle('show', past);
  }
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    if (open) {
      mnav.hidden = false; root.style.overflow = 'hidden';
      requestAnimationFrame(function () { requestAnimationFrame(function () { mnav.classList.add('is-open'); }); });
      hdr.classList.add('is-solid');
    } else {
      mnav.classList.remove('is-open'); root.style.overflow = '';
      setTimeout(function () { if (!mnav.classList.contains('is-open')) mnav.hidden = true; }, 500);
      chrome();
    }
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mnav.hidden) setMenu(false); });
  $$('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); splitAll(); measureAll(); });
  });

  /* ---------- Horgonyok: a címekre érkeznek ---------- */
  function anchorTarget(id) {
    var s = D.getElementById(id); if (!s) return null;
    if (id === 'top') return 0;
    if (id === 'etlap') return absTop($('.plates', s)) - 110;
    if ((id === 'termek' && s.classList.contains('is-3d')) || (id === 'kepek' && s.classList.contains('is-h'))) return absTop(s);
    return absTop($('h2', s) || s) - (innerWidth < 761 ? 104 : 136);
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1), y = anchorTarget(id);
      if (y == null) return;
      e.preventDefault();
      if (!mnav.hidden) setMenu(false);
      window.scrollTo({ top: Math.max(0, y), behavior: reduced ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', '#' + id);
    });
  });

  /* ---------- Címek soronként csúsznak elő a maszk alól ---------- */
  var slEls = $$('main h2, .lede');
  function split(el) {
    var txt = el.textContent;
    el.setAttribute('aria-label', txt);
    el.textContent = '';
    var words = txt.split(/([ \n\t]+)/), spans = [];
    words.forEach(function (w) {
      if (!w) return;
      if (/^[ \n\t]+$/.test(w)) { el.appendChild(D.createTextNode(w)); return; }
      var s = D.createElement('span'); s.className = 'w'; s.textContent = w; el.appendChild(s); spans.push(s);
    });
    // sorokra bontás a szavak függőleges helyzete alapján
    var lines = [], top = null;
    spans.forEach(function (s) {
      var t = s.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; }
      lines[lines.length - 1].push(s);
    });
    el.textContent = '';
    lines.forEach(function (ln, i) {
      var o = D.createElement('span'); o.className = 'ln'; o.setAttribute('aria-hidden', 'true');
      var inner = D.createElement('span'); inner.className = 'ln__i'; inner.style.setProperty('--i', String(i));
      inner.textContent = ln.map(function (s) { return s.textContent; }).join(' ');
      o.appendChild(inner); el.appendChild(o);
      if (i < lines.length - 1) el.appendChild(D.createTextNode(' '));
    });
    el.classList.add('sl');
  }
  function splitAll() {
    if (reduced) return;
    slEls.forEach(function (el) {
      // a nyelvváltás a sima szöveget írja vissza; a felbontás mindig a friss szövegből indul
      if (el.classList.contains('sl') && el.querySelector('.ln')) el.textContent = el.getAttribute('aria-label');
      split(el);
    });
  }

  /* ---------- Három terem: 3D folyosó (egérrel, grafikus chippel, széles képernyőn) ---------- */
  var termek = $('.termek'), rooms = $$('.room'), rcaps = $$('.rcap'), thead = $('.termek .head');
  var corridor = rich && termek && innerWidth >= 1100;
  if (corridor) {
    termek.classList.add('is-3d');
    rooms.forEach(function (r, i) { r.classList.remove('rv'); r.style.zIndex = String(3 - i); });
    thead.classList.remove('rv');
  }

  /* ---------- Megjelenés görgetésre (CSS transition), egyszerre érkezők lépcsőzve ---------- */
  function reveals() {
    var rvEls = $$('.rv, .thread, .sl');
    if ('IntersectionObserver' in window && root.classList.contains('js')) {
      var io = new IntersectionObserver(function (es) {
        var k = 0;
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', String(k++));
          el.classList.add('in'); io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -13% 0px' });
      rvEls.forEach(function (el) {
        // ami betöltéskor már a képernyő fölött van (középről újratöltés), az azonnal látszik
        if (el.getBoundingClientRect().bottom < 0) { el.classList.add('in', 'now'); return; }
        io.observe(el);
      });
    } else rvEls.forEach(function (el) { el.classList.add('in'); });
  }
  /* ---------- Nyitókép: WebGL, mélységtérkép szerinti mozgás ---------- */
  var VS = 'attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}';
  var FS = [
    'precision highp float;varying vec2 v;',
    'uniform sampler2D uI,uD;uniform vec2 uRes,uM;uniform float uAR,uPush,uOver;',
    'const vec2 POS=vec2(.44,.5);const vec2 VP=vec2(.47,.44);',
    'vec2 img(vec2 p){float sa=uRes.x/uRes.y;vec2 s=sa>uAR?vec2(1.,uAR/sa):vec2(sa/uAR,1.);',
    ' vec2 o=(1.-s)*POS;vec2 c=o+.5*s;return c+(o+p*s-c)/uOver;}',
    'void main(){vec2 p=v;',
    ' for(int i=0;i<3;i++){float d=texture2D(uD,img(p)).r;float k=uPush*(.025+.13*d);',
    '  p=VP+(v-VP)/(1.+k)+uM*(d-.42)*.024;}',
    ' gl_FragColor=vec4(texture2D(uI,img(p)).rgb,1.);}'
  ].join('\n');
  var G = { ok: false, push: 0, pushT: 0, m: [0, 0], mT: [0, 0], scroll: 0, raf: 0, intro: null };
  function glInit() {
    var cv = $('.hero__gl'), im = $('.hero__img');
    var gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
    if (!gl) return;
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS); if (!vs || !fs) return;
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var al = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['uI', 'uD', 'uRes', 'uM', 'uAR', 'uPush', 'uOver'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    function tex(unit, src) {
      var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
    }
    var dep = new Image(); dep.decoding = 'async'; dep.src = 'img/hero-melyseg.webp?v=5';
    Promise.all([im.decode ? im.decode().catch(function () {}) : null, dep.decode ? dep.decode() : new Promise(function (r) { dep.onload = r; })]).then(function () {
      if (!im.naturalWidth || !dep.naturalWidth) return;
      tex(0, im); tex(1, dep);
      gl.uniform1i(U.uI, 0); gl.uniform1i(U.uD, 1);
      gl.uniform1f(U.uAR, im.naturalWidth / im.naturalHeight); gl.uniform1f(U.uOver, 1.06);
      G.gl = gl; G.cv = cv; G.U = U; G.ok = true;
      size(); draw(); hero.classList.add('gl-on'); kick();
    }).catch(function () {});
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); G.ok = false; hero.classList.remove('gl-on'); });
  }
  var lastW = 0, lastH = 0;
  function size() {
    if (!G.ok) return;
    var w = G.cv.clientWidth, h = G.cv.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    lastW = w; lastH = h;
    G.cv.width = Math.round(w * dpr); G.cv.height = Math.round(h * dpr);
    G.gl.viewport(0, 0, G.cv.width, G.cv.height); G.gl.uniform2f(G.U.uRes, w, h);
  }
  function draw() {
    var gl = G.gl, U = G.U;
    gl.uniform1f(U.uPush, G.push + G.scroll); gl.uniform2f(U.uM, G.m[0], G.m[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  // csak akkor rajzol, ha valami mozog; utána leáll
  function frame(t) {
    G.raf = 0;
    if (!G.ok || !heroVisible) return;
    var moving = false;
    if (G.intro) {
      var k = clamp((t - G.intro.t0) / G.intro.dur, 0, 1);
      G.push = lerp(G.intro.from, G.intro.to, easeOut(k));
      if (k < 1) moving = true; else G.intro = null;
    }
    for (var i = 0; i < 2; i++) {
      var dm = G.mT[i] - G.m[i];
      if (Math.abs(dm) > 0.0005) { G.m[i] += dm * 0.06; moving = true; } else G.m[i] = G.mT[i];
    }
    draw();
    if (moving) kick();
  }
  function kick() { if (!G.raf && G.ok) G.raf = requestAnimationFrame(frame); }
  function camPush(dur) { G.intro = { t0: performance.now(), dur: dur, from: G.push, to: 0.34 }; kick(); }
  if (canHover) {
    hero.addEventListener('pointermove', function (e) {
      G.mT[0] = (e.clientX / innerWidth - .5) * 2; G.mT[1] = (e.clientY / innerHeight - .5) * 2; kick();
    });
    hero.addEventListener('pointerleave', function () { G.mT[0] = G.mT[1] = 0; kick(); });
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; hero.classList.toggle('off', !heroVisible); if (heroVisible) kick(); }).observe(hero);
  window.addEventListener('resize', function () {
    var w = innerWidth, h = innerHeight;
    if (Math.abs(w - lastW) > 0 || Math.abs(h - lastH) > 160) { size(); kick(); }
  });

  /* ---------- Nyitóanimáció ---------- */
  var EX = 'cubic-bezier(.16,1,.3,1)', IO = 'cubic-bezier(.65,0,.35,1)';
  function runIntro() {
    var list = [];
    function an(el, kf, o) { if (!el) return; var x = el.animate(kf, Object.assign({ fill: 'both' }, o)); list.push(x); }
    var up = function (d) { return [{ opacity: 0, transform: 'translate3d(0,' + d + ',0)' }, { opacity: 1, transform: 'none' }]; };
    an($('.hero__night'), [{ opacity: 1 }, { opacity: 0 }], { duration: 2300, delay: 80, easing: 'cubic-bezier(.45,0,.2,1)' });
    $$('.crest__arch path').forEach(function (p, i) {
      an(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1800, delay: 450 + (i > 1 ? 280 : 0), easing: IO });
    });
    an($('.crest__key'), [{ opacity: 0, transform: 'rotate(45deg) scale(.2)' }, { opacity: 1, transform: 'rotate(45deg) scale(1)' }], { duration: 800, delay: 2120, easing: EX });
    $$('.hero .crest__word b').forEach(function (b, i) { an(b, up('.34em'), { duration: 1200, delay: 1000 + i * 75, easing: EX }); });
    an($('.hero .crest__sub'), up('10px'), { duration: 1100, delay: 1750, easing: EX });
    an($('.crest__rule'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1000, delay: 1900, easing: IO });
    an($('.crest__since'), up('8px'), { duration: 1100, delay: 2050, easing: EX });
    an($('.hero__h1'), up('18px'), { duration: 1400, delay: 2150, easing: EX });
    an($('.hero__today'), up('14px'), { duration: 1300, delay: 2300, easing: EX });
    an($('.hero__cta'), up('14px'), { duration: 1300, delay: 2420, easing: EX });
    an(hdr, [{ opacity: 0 }, { opacity: 1 }], { duration: 1200, delay: 2500, easing: 'linear' });
    an($('.hero__cue'), [{ opacity: 0 }, { opacity: 1 }], { duration: 1000, delay: 3100, easing: 'linear' });
    camPush(5200);
    var done = function () { root.classList.remove('intro-on', 'intro-run'); root.classList.add('intro-done'); list.forEach(function (x) { x.cancel(); }); };
    Promise.all(list.map(function (x) { return x.finished; })).then(done, done);
  }
  function start() {
    var skip = !root.classList.contains('intro-on') || scrollY > 80 || !Element.prototype.animate;
    if (skip) { root.classList.remove('intro-on'); root.classList.add('intro-done'); G.push = 0.34; kick(); return; }
    root.classList.add('intro-run');
    runIntro();
  }

  /* ---------- Képek: gépen vízszintes galéria, a szakasz megáll, a képek oldalra haladnak ---------- */
  var kepek = $('.kepek'), hz = rich && kepek && innerWidth >= 1100;
  var KH = { top: 0, range: 1, q: 0, cur: '' }, kTitle = kepek && $('h2', kepek), kColl = kepek && $('.coll', kepek), kFig = kepek ? $$('.coll figure', kepek) : [];
  if (hz) {
    kepek.classList.add('is-h'); kepek.classList.remove('flow');
    kFig.forEach(function (f) { f.classList.remove('rv'); });
  }
  function hzMeasure() {
    if (!hz) return;
    kepek.style.height = '';
    var wrap = $('.wrap', kepek), dist = Math.max(0, kTitle.offsetWidth + kColl.offsetWidth - vw);
    KH.range = Math.max(1, dist * 1.15); KH.dist = dist;
    kepek.style.height = px(vh + KH.range);
    KH.top = absTop(kepek); KH.cur = '';
    KH.fx = kFig.map(function (f) { return f.offsetLeft; });
    KH.fw = kFig.map(function (f) { return f.offsetWidth; });
  }
  function hzRender(q) {
    var key = q.toFixed(4); if (key === KH.cur) return; KH.cur = key;
    var x = -KH.dist * q, tf = 'translate3d(' + px(x) + ',0,0)';
    kTitle.style.transform = tf; kColl.style.transform = tf;
    kFig.forEach(function (f, i) {
      var c = KH.fx[i] + x + KH.fw[i] / 2 - vw / 2;
      if (c < vw * .42) f.classList.add('in');
      var im = $('img', f); im.style.transform = 'translate3d(' + px(-c * .06) + ',0,0)';
    });
  }

  /* ---------- Szakaszok billenése: görgetésre befelé dőlnek, kifelé visszadőlnek (egérrel) ---------- */
  var flows = $$('.flow').map(function (sec) {
    var o = { el: sec, top: 0, h: 0, e: 1, x: 0, te: 1, tx: 0, cur: '' };
    if (rich) {
      o.dim = D.createElement('div'); o.dim.className = 'flow-dim'; o.dim.setAttribute('aria-hidden', 'true'); sec.appendChild(o.dim);
      sec.style.willChange = 'transform';
    }
    return o;
  });
  function flowMeasure() { flows.forEach(function (o) { o.top = absTop(o.el); o.h = o.el.offsetHeight; }); }
  function flowApply(o) {
    var seen = o.top < scrollY + vh && o.top + o.h > scrollY;
    var tf = '', org = '', d = 0;
    if (seen && o.x > .0005) { tf = 'perspective(1200px) rotateX(' + (o.x * 9).toFixed(3) + 'deg) scale(' + (1 - o.x * .07).toFixed(4) + ')'; org = '50% 100%'; d = o.x * .6; }
    else if (seen && o.e < .9995) { var u = 1 - o.e; tf = 'perspective(1200px) rotateX(' + (-u * 12).toFixed(3) + 'deg) scale(' + (1 - u * .08).toFixed(4) + ')'; org = '50% 0%'; d = u * .5; }
    var key = tf + org + d.toFixed(3);
    if (key === o.cur) return;
    o.cur = key; o.el.style.transformOrigin = org; o.el.style.transform = tf; o.dim.style.opacity = d.toFixed(3);
  }
  if (!rich && touch && !reduced && 'IntersectionObserver' in window) {
    // érintőn: a még lent lévő szakasz kicsit hátradőlve vár, és amikor beér, egyszer kiegyenesedik
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; tio.unobserve(el);
        el.style.transition = 'transform 1.2s cubic-bezier(.16,1,.3,1)'; el.style.transform = '';
        setTimeout(function () { el.style.transition = ''; el.style.transformOrigin = ''; }, 1300);
      });
    }, { rootMargin: '0px 0px -4% 0px' });
    flows.forEach(function (o) {
      if (o.el.getBoundingClientRect().top < vh) return;
      o.el.style.transformOrigin = '50% 0%'; o.el.style.transform = 'perspective(1200px) rotateX(-10deg) scale(.93)';
      tio.observe(o.el);
    });
  }

  /* ---------- Folyosó ---------- */
  var CO = { top: 0, range: 1, q: 0, cur: '' }, rw = 0, rh = 0;
  function corMeasure() {
    if (!corridor) return;
    CO.top = absTop(termek); CO.range = Math.max(1, termek.offsetHeight - vh);
    rw = rooms[0].offsetWidth; rh = rooms[0].offsetHeight; CO.cur = '';
  }
  function corRender(q) {
    var k = q.toFixed(4); if (k === CO.cur) return; CO.cur = k;
    // mindegyik teremnél megállunk egy kicsit, köztük gyorsabban haladunk
    var DZ = 1500, st = clamp(q * 1.08 - .04, 0, 1) * 2, si = Math.min(1, Math.floor(st)), cam = DZ * (si + eio(seg(st - si, .3, .7)));
    rooms.forEach(function (r, i) {
      var z = -i * DZ + cam, x = (i % 2 ? 1 : -1) * vw * .17;
      var o = z > 220 ? clamp(1 - (z - 220) / 420, 0, 1) : clamp((z + 3000) / 900, 0, 1);
      r.style.visibility = o > 0 ? '' : 'hidden';
      r.style.opacity = o.toFixed(3);
      r.style.transform = 'translate3d(' + px(x - rw / 2) + ',' + px(-rh / 2) + ',' + px(z) + ')';
      if (z > -1700) r.classList.add('in');
      var c = clamp(1 - Math.abs(z) / 650, 0, 1);
      rcaps[i].style.opacity = c.toFixed(3);
      rcaps[i].style.transform = 'translate3d(0,' + px(-50 + 24 * (1 - c)) + ',0)';
    });
    thead.style.opacity = (1 - seg(q, .12, .2)).toFixed(3);
  }

  /* ---------- Tányérok, borlista-szalag, ételkép az egér mellett, kurzor ---------- */
  var plates = $$('.plate img'), platesBox = $('.plates'), PF = [-0.07, 0.05, -0.04, 0.08], PL = [];
  function plMeasure() { PL = plates.map(function (im) { return { top: absTop(im), h: im.offsetHeight }; }); }
  var marq = $('.marq__t'), MQ = { a: null, rate: 1, target: 1, on: false };
  if (marq && !reduced && marq.animate) {
    MQ.a = marq.animate([{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(-50%,0,0)' }], { duration: 46000, iterations: Infinity });
    MQ.a.pause();
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { MQ.on = es[0].isIntersecting; if (MQ.on) MQ.a.play(); else MQ.a.pause(); }).observe($('.marq'));
  }
  var dish = $('.dish'), dishImg = dish && $('img', dish), DS = { x: 0, y: 0, tx: 0, ty: 0, r: 0, on: false };
  var cur = $('.cur'), CU = { x: -100, y: -100, tx: -100, ty: -100, on: false };
  var useCursor = rich && cur;
  if (useCursor) root.classList.add('cur-on');
  var mags = rich ? $$('.btn').map(function (b) { return { el: b, x: 0, y: 0, tx: 0, ty: 0 }; }) : [];

  /* ---------- Egy közös képkocka-ciklus: csak akkor fut, ha valami mozog ---------- */
  var raf = 0, last = 0, lastY = scrollY, vel = 0, tilt = plates.map(function () { return { x: 0, y: 0, tx: 0, ty: 0 }; });
  function loop() { if (!raf) raf = requestAnimationFrame(tick); }
  function ease(o, kx, ky, k) {
    var dx = o[kx[1]] - o[kx[0]], dy = o[ky[1]] - o[ky[0]];
    if (Math.abs(dx) > .05 || Math.abs(dy) > .05) { o[kx[0]] += dx * k; o[ky[0]] += dy * k; return true; }
    o[kx[0]] = o[kx[1]]; o[ky[0]] = o[ky[1]]; return false;
  }
  function tick(t) {
    raf = 0;
    var dt = last ? Math.min(64, t - last) : 16; last = t;
    var k = 1 - Math.exp(-dt / 110), moving = false, y = scrollY;
    var v = (y - lastY) / dt; lastY = y;
    vel += (v - vel) * (1 - Math.exp(-dt / 160));
    if (Math.abs(vel) > .002) moving = true; else vel = 0;
    // nyitókép: a felirat lassabban megy fel és elhalványul, a pince tovább nyomul (egérrel)
    if (canHover && !reduced && y < hero.offsetHeight * 1.05) {
      var hk = clamp(y / hero.offsetHeight, 0, 1);
      heroIn.style.transform = 'translate3d(0,' + px(y * .32) + ',0)';
      heroIn.style.opacity = String(clamp(1 - hk * 1.5, 0, 1));
      if (Math.abs(G.scroll - hk * .7) > .0005) { G.scroll = hk * .7; kick(); }
    }
    // folyosó
    if (corridor) {
      var tq = clamp((y - CO.top) / CO.range, 0, 1), dq = tq - CO.q;
      if (Math.abs(dq) > .0004) { CO.q += dq * k; moving = true; } else CO.q = tq;
      if (y + vh > CO.top - 200 && y < CO.top + CO.range + vh + 200) corRender(CO.q);
    }
    // vízszintes galéria
    if (hz) {
      var th = clamp((y - KH.top) / KH.range, 0, 1), dh = th - KH.q;
      if (Math.abs(dh) > .0003) { KH.q += dh * k; moving = true; } else KH.q = th;
      if (y + vh > KH.top - 100 && y < KH.top + KH.range + vh) hzRender(KH.q);
    }
    // billenő szakaszok
    if (rich) flows.forEach(function (o) {
      o.te = clamp((y + vh - o.top) / (vh * .7), 0, 1);
      o.tx = clamp((y + vh * .7 - (o.top + o.h)) / (vh * .7), 0, 1);
      var de = o.te - o.e, dx = o.tx - o.x;
      if (Math.abs(de) > .0005) { o.e += de * k; moving = true; } else o.e = o.te;
      if (Math.abs(dx) > .0005) { o.x += dx * k; moving = true; } else o.x = o.tx;
      flowApply(o);
    });
    // tányérok: lassan úsznak és az egér felé dőlnek
    if (canHover && !reduced && PL.length && y + vh > PL[0].top - 300 && y < PL[0].top + 900) {
      plates.forEach(function (im, i) {
        var c = PL[i].top + PL[i].h / 2 - (y + vh / 2), tl = tilt[i];
        if (ease(tl, ['x', 'tx'], ['y', 'ty'], k)) moving = true;
        im.style.transform = 'translate3d(0,' + px(c * PF[i]) + ',0) perspective(700px) rotateX(' + tl.y.toFixed(2) + 'deg) rotateY(' + tl.x.toFixed(2) + 'deg)';
      });
    }
    // borlista-szalag: görgetéskor gyorsul, az iránya a görgetéssel fordul
    if (MQ.a && MQ.on && canHover) {
      MQ.target = clamp(1 + vel * 4, -6, 7);
      if (Math.abs(MQ.target - MQ.rate) > .02) { MQ.rate += (MQ.target - MQ.rate) * k; MQ.a.playbackRate = MQ.rate; moving = true; }
    }
    // ételkép az egér mellett
    if (dish && (DS.on || dish.classList.contains('on'))) {
      var ox = DS.x;
      if (ease(DS, ['x', 'tx'], ['y', 'ty'], 1 - Math.exp(-dt / 90))) moving = true;
      DS.r += (clamp((DS.x - ox) * .5, -12, 12) - DS.r) * .2;
      if (Math.abs(DS.r) > .05) moving = true;
      dish.style.transform = 'translate3d(' + px(DS.x) + ',' + px(DS.y) + ',0) rotate(' + DS.r.toFixed(2) + 'deg)';
    }
    // kurzor és mágneses gombok
    if (useCursor) {
      if (ease(CU, ['x', 'tx'], ['y', 'ty'], 1 - Math.exp(-dt / 55))) moving = true;
      cur.style.transform = 'translate3d(' + px(CU.x) + ',' + px(CU.y) + ',0)';
      mags.forEach(function (m) {
        if (ease(m, ['x', 'tx'], ['y', 'ty'], k)) moving = true;
        m.el.style.transform = m.x || m.y ? 'translate3d(' + px(m.x) + ',' + px(m.y) + ',0)' : '';
      });
    }
    if (moving) loop(); else last = 0;
  }
  window.addEventListener('scroll', function () {
    // görgetéskor az ételkép eltűnik (az egér helyben marad, a lista elmegy alóla)
    if (DS.on) { DS.on = false; dish.classList.remove('on'); }
    chrome(); loop();
  }, { passive: true });

  if (canHover && !reduced) {
    platesBox.addEventListener('pointermove', function (e) {
      plates.forEach(function (im, i) {
        var r = im.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, yy = (e.clientY - r.top) / r.height - .5;
        var near = Math.abs(x) < .8 && Math.abs(yy) < .8;
        tilt[i].tx = near ? x * 18 : 0; tilt[i].ty = near ? -yy * 14 : 0;
      });
      loop();
    });
    platesBox.addEventListener('pointerleave', function () { tilt.forEach(function (t) { t.tx = t.ty = 0; }); loop(); });
    // keretes fotók: a kép az egér felé dől, a keret marad
    $$('.fr').forEach(function (fr) {
      var ph = $('.ph', fr);
      fr.addEventListener('pointermove', function (e) {
        var r = fr.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, yy = (e.clientY - r.top) / r.height - .5;
        ph.style.transform = 'perspective(1000px) rotateX(' + (-yy * 7).toFixed(2) + 'deg) rotateY(' + (x * 9).toFixed(2) + 'deg)';
      });
      fr.addEventListener('pointerleave', function () { ph.style.transform = ''; });
    });
    // étlap: az ételek nevére állva a tányér képe az egér mellett úszik
    if (dish) $$('[data-dish]').forEach(function (li) {
      li.addEventListener('pointerenter', function (e) {
        dishImg.src = 'img/etel-' + li.getAttribute('data-dish') + '.webp?v=5';
        if (!DS.on) { DS.x = DS.tx = e.clientX + 70; DS.y = DS.ty = e.clientY - 240; }
        DS.on = true; dish.classList.add('on'); loop();
      });
      li.addEventListener('pointerleave', function () { DS.on = false; dish.classList.remove('on'); });
    });
    D.addEventListener('pointermove', function (e) {
      if (DS.on) { DS.tx = e.clientX + 70; DS.ty = e.clientY - 240; }
      if (useCursor) {
        CU.tx = e.clientX; CU.ty = e.clientY;
        if (!CU.on) { CU.on = true; CU.x = CU.tx; CU.y = CU.ty; cur.classList.add('on'); }
        mags.forEach(function (m) {
          var r = m.el.getBoundingClientRect(), cx = r.left + r.width / 2 - m.x, cy = r.top + r.height / 2 - m.y;
          var dx = e.clientX - cx, dy = e.clientY - cy, near = Math.abs(dx) < r.width / 2 + 40 && Math.abs(dy) < r.height / 2 + 40;
          m.tx = near ? dx * .28 : 0; m.ty = near ? dy * .38 : 0;
        });
      }
      loop();
    }, { passive: true });
    if (useCursor) {
      D.addEventListener('pointerover', function (e) {
        var t = e.target.closest && e.target.closest('a, button, [data-dish], .fr, .coll figure, .room');
        cur.classList.toggle('big', !!t);
      });
      D.documentElement.addEventListener('pointerleave', function () { cur.classList.remove('on'); CU.on = false; });
    }
  }

  /* ---------- Mérés; átméretezéskor csak szélességváltásra vagy nagy magasságváltásra ---------- */
  function measureAll() { vw = innerWidth; vh = innerHeight; hzMeasure(); corMeasure(); flowMeasure(); plMeasure(); CO.cur = ''; flows.forEach(function (o) { o.cur = '_'; }); loop(); }
  var mw = innerWidth, mh = innerHeight;
  window.addEventListener('resize', function () {
    var w = innerWidth, h = innerHeight;
    if (w === mw && Math.abs(h - mh) < 160) return;
    var wc = w !== mw; mw = w; mh = h;
    if (wc) splitAll();
    measureAll();
  });

  // a betű és a nyitókép megvárása (legfeljebb 1,6 mp), hogy az animáció közben semmi ne cserélődjön
  var heroImg = $('.hero__img');
  Promise.race([
    Promise.all([D.fonts ? Promise.all([D.fonts.load('500 40px EBG'), D.fonts.load('italic 400 20px EBG')]) : null, heroImg.decode ? heroImg.decode().catch(function () {}) : null]),
    new Promise(function (r) { setTimeout(r, 1600); })
  ]).then(function () {
    splitAll(); reveals(); measureAll(); chrome();
    // a betűcsere utáni újratördelés az indulás előtt fusson le, ne az animáció első képkockáiban
    void D.body.offsetHeight;
    requestAnimationFrame(function () { requestAnimationFrame(start); });
  });
  window.addEventListener('load', measureAll);
  if (!reduced) glInit();
})();
