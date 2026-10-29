/* Gyógygödör Borozó, bemutató oldal, v4
   Fent a Fő tér, görgetésre a boltíves ablakon át le a pincébe; lent a három terem 3D folyosóként, a szakaszok
   görgetésre billennek. Natív görgetés. Görgetéshez kötött mozgás csak egérrel; érintőn minden időzített, egyszer fut.
   A 3D billenés és a folyosó csak valódi grafikus chippel megy (szoftveres rajzolásnál a régi, egyszerű változat). */
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
    'd10': 'Riesiges Wiener Schnitzel mit Käse, Sauerrahm und gemischter Beilage', 'd10t': 'Empfehlung der Küchenchefin',
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
    'borok.more': 'Auch in der Flasche, zum Beispiel Prémium Furmint 2018, Kékfrankos und Prémium Cabernet Sauvignon. Bier gibt es von Soproni und Óvatos Duhaj, Pálinka von Karikás und Palotás.',
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
    'vel.q3': '„Sopron wäre ärmer ohne sie!“', 'vel.s3': 'medwe Fórum (übersetzt)',
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
    'borok.more': 'There are bottles too, such as Prémium Furmint 2018, Kékfrankos and Prémium Cabernet Sauvignon. Beer from Soproni and Óvatos Duhaj, pálinka from Karikás and Palotás.',
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
    'vel.q3': '“Sopron would be poorer without it!”', 'vel.s3': 'medwe Fórum (translated)',
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
    'e4.alt': 'Schokoladensoufflé mit Schlagobers und Erdbeersoße', 'e4.cap': 'Schokoladensoufflé',
    'b1.alt': 'Eine Flasche Furmint', 'b2.alt': 'Eine Flasche Kékfrankos', 'b3.alt': 'Eine Flasche Cabernet Sauvignon',
    'le.c1': 'Das Kossow-Haus am Hauptplatz', 'le.c2': 'Der Eingang unter dem Schild', 'le.c3': 'Die Treppe hinunter in den Keller',
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
    'b1.alt': 'A bottle of Furmint', 'b2.alt': 'A bottle of Kékfrankos', 'b3.alt': 'A bottle of Cabernet Sauvignon',
    'le.c1': 'The Kossow House on the main square', 'le.c2': 'The entrance under the sign', 'le.c3': 'The stairs down to the cellar',
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
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function eio(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function eo3(t) { return 1 - Math.pow(1 - t, 3); }
  function px(v) { return v.toFixed(1) + 'px'; }
  // oldalbeli helyzet a transzformációk nélkül (egy éppen billenő szakaszban se mérjünk ferdén)
  function absTop(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }
  var vw = innerWidth, vh = innerHeight;

  /* ---------- Fejléc, menü, hívósáv ---------- */
  var hdr = $('#hdr'), mcall = $('.mcall'), burger = $('.hdr__burger'), mnav = $('#mnav');
  var le = $('.le'), stage = $('.le__stage');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    if (open) {
      mnav.hidden = false; root.style.overflow = 'hidden';
      requestAnimationFrame(function () { requestAnimationFrame(function () { mnav.classList.add('is-open'); }); });
      hdr.classList.add('is-solid'); hdr.classList.remove('hdr--ink');
    } else {
      mnav.classList.remove('is-open'); root.style.overflow = '';
      setTimeout(function () { if (!mnav.classList.contains('is-open')) mnav.hidden = true; }, 500);
      chrome();
    }
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mnav.hidden) setMenu(false); });
  $$('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });

  /* ---------- Horgonyok: a címekre érkeznek ---------- */
  function anchorTarget(id) {
    var s = D.getElementById(id); if (!s) return null;
    if (id === 'top') return 0;
    if (id === 'etlap') return absTop($('.plates', s)) - 110;
    if (id === 'termek' && s.classList.contains('is-3d')) return absTop(s);
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

  /* ---------- Három terem: 3D folyosó (egérrel, grafikus chippel, széles képernyőn) ---------- */
  var termek = $('.termek'), rooms = $$('.room'), rcaps = $$('.rcap'), thead = $('.termek .head');
  var corridor = rich && termek && innerWidth >= 1100;
  if (corridor) {
    termek.classList.add('is-3d');
    rooms.forEach(function (r, i) { r.classList.remove('rv'); r.style.zIndex = String(3 - i); });
    thead.classList.remove('rv');
  }

  /* ---------- Megjelenés görgetésre (CSS transition), egyszerre érkezők lépcsőzve ---------- */
  var rvEls = $$('.rv, .thread');
  var io = null;
  if ('IntersectionObserver' in window && root.classList.contains('js')) {
    io = new IntersectionObserver(function (es) {
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

  /* ---------- Lejárat: krém lap, boltíves ablak, Kossow-ház, bejárat, lépcső, pince ---------- */
  var leOn = !reduced && !!stage;
  var win = $('.le__win'), L = $$('.le__l'), haz = $('.le__haz'), txt = $('.le__txt'), slot = $('.le__slot');
  var frame = $('.le__frame'), key = $('.le__key'), cue = $('.le__cue'), ltop = $('.le__top');
  var caps = $$('.le__cap span'), crest = $('.le .crest');
  var cArch = $$('.crest__arch path', crest), cKey = $('.crest__key', crest), cWord = $$('.crest__word b', crest);
  var cSub = $('.crest__sub', crest), cRule = $('.crest__rule', crest), cSince = $('.crest__since', crest);
  var LE = { p: 0, t: 0, range: 1, W: 0, H: 0, s0: null, film: null, cur: '' };
  if (leOn) { le.classList.add('le-on'); if (touch) le.classList.add('le-touch'); }
  else { root.classList.add('le-static'); }

  function leMeasure() {
    if (!leOn) return;
    var sr = stage.getBoundingClientRect(), r = slot.getBoundingClientRect();
    LE.W = sr.width; LE.H = sr.height;
    LE.range = Math.max(1, le.offsetHeight - LE.H);
    LE.s0 = { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
    // a ház képe: a kapu és a tábla (a forráskép 18,5–68,5%-a) pont a boltíves ablakba esik
    var Wc = Math.max(LE.W, LE.H * 1.5), Hc = Wc / 1.5;
    haz.style.width = px(Wc); haz.style.height = px(Hc); haz.style.right = 'auto'; haz.style.bottom = 'auto';
    LE.Wc = Wc; LE.Hc = Hc;
    LE.cur = '';
    leRender(LE.p, true);
  }
  function frameMeasure() {
    var r = slot.getBoundingClientRect();
    // a keret íve pixelben: egyenletes lépték kell, különben a szaggatás (kirajzolás) rossz helyen áll meg
    var fw = r.width + 28, fh = r.height + 14, fr = fw / 2, fp = $$('path', frame);
    frame.setAttribute('viewBox', '0 0 ' + fw.toFixed(1) + ' ' + fh.toFixed(1));
    fp[0].setAttribute('d', 'M0 ' + fh.toFixed(1) + 'V' + fr.toFixed(1) + 'A' + fr.toFixed(1) + ' ' + fr.toFixed(1) + ' 0 0 1 ' + fr.toFixed(1) + ' 0');
    fp[1].setAttribute('d', 'M' + fw.toFixed(1) + ' ' + fh.toFixed(1) + 'V' + fr.toFixed(1) + 'A' + fr.toFixed(1) + ' ' + fr.toFixed(1) + ' 0 0 0 ' + fr.toFixed(1) + ' 0');
  }
  function archPath(x, y, w, h) {
    var r = w / 2;
    return 'path("M' + x.toFixed(1) + ' ' + (y + h).toFixed(1) + 'V' + (y + r).toFixed(1) + 'A' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 0 1 ' + (x + w).toFixed(1) + ' ' + (y + r).toFixed(1) + 'V' + (y + h).toFixed(1) + 'Z")';
  }
  function leRender(p, force) {
    if (!leOn || !LE.s0) return;
    var k = p.toFixed(4);
    if (k === LE.cur && !force) return;
    LE.cur = k;
    var W = LE.W, H = LE.H, s0 = LE.s0;
    var A = eio(seg(p, 0, .3)), T = seg(p, 0, .15), B = seg(p, .3, .5), C = seg(p, .5, .7), E = seg(p, .7, .88);
    // 1. a boltíves ablak kinyílik: a végén nagyobb a képernyőnél, a kerek teteje a sarkokon túl jár
    var R1 = W * .66, w1 = R1 * 2, x1 = (W - w1) / 2, y1 = -R1 + W * .28, h1 = H - y1 + 2;
    var cx0 = lerp(s0.x, x1, A), cy0 = lerp(s0.y, y1, A), cw = lerp(s0.w, w1, A), ch = lerp(s0.h, h1, A);
    win.style.clipPath = A < 1 ? archPath(cx0, cy0, cw, ch) : 'none';
    // a ház képe: az ablakba illesztett kivágásból (a kapu és a tábla) a kapura közelít, majd át a kapun;
    // közben mindig kitölti az ablak látható részét
    var Wc = LE.Wc, Hc = LE.Hc;
    var sA = Math.max(s0.w / (.5 * Wc), s0.h / Hc), txA = s0.x + s0.w / 2 - .435 * Wc * sA, tyA = s0.y + s0.h / 2 - .5 * Hc * sA;
    var sB = 1.1, txB = clamp(W * .5 - .35 * Wc * sB, W - Wc * sB, 0), tyB = clamp(H * .56 - .62 * Hc * sB, H - Hc * sB, 0);
    var vx = Math.max(0, cx0), vy = Math.max(0, cy0), vr = Math.min(W, cx0 + cw), vb = Math.min(H, cy0 + ch);
    var s = Math.max(lerp(sA, sB, A), (vr - vx) / Wc, (vb - vy) / Hc);
    var tx = clamp(lerp(txA, txB, A), vr - Wc * s, vx), ty = clamp(lerp(tyA, tyB, A), vb - Hc * s, vy);
    var z = 1 + .32 * eio(B), cx = W * .5, cy = H * .56;
    tx = cx - (cx - tx) * z; ty = cy - (cy - ty) * z; s *= z;
    haz.style.transform = 'translate3d(' + px(tx) + ',' + px(ty) + ',0) scale(' + s.toFixed(4) + ')';
    // 2–4. a bejárat, a lépcső és a pince: a régi kép tovább nő (átmegyünk rajta), az új a szakasz közepén úszik át rá
    var b2 = eio(seg(B, .2, .8)), c2 = eio(seg(C, .2, .8)), e2 = eio(seg(E, .2, .8));
    L[0].style.opacity = String(1 - b2);
    L[1].style.opacity = (b2 * (1 - c2)).toFixed(3);
    L[1].style.transform = 'scale(' + (1.16 - .16 * eo3(B) + .3 * eio(C)).toFixed(4) + ')';
    L[2].style.opacity = (c2 * (1 - e2)).toFixed(3);
    L[2].style.transform = 'translate3d(0,' + px(-H * .05 * (1 - eo3(C))) + ',0) scale(' + (1.14 - .14 * eo3(C) + .28 * eio(E)).toFixed(4) + ')';
    L[3].style.opacity = e2.toFixed(3);
    L[3].style.transform = 'scale(' + (1.12 - .12 * eo3(E)).toFixed(4) + ')';
    // a krém lap szövege kiúszik, a keret elhalványul
    txt.style.opacity = (1 - T).toFixed(3);
    txt.style.transform = 'translate3d(' + px(-44 * eo3(T)) + ',0,0)';
    var f = (1 - seg(p, 0, .05)).toFixed(3);
    frame.style.opacity = f; key.style.opacity = f; cue.style.opacity = f;
    ltop.style.opacity = seg(p, .12, .3).toFixed(3);
    // feliratok a lépésekhez
    var cv = [seg(p, .2, .27) * (1 - seg(p, .44, .5)), seg(p, .44, .51) * (1 - seg(p, .64, .7)), seg(p, .64, .71) * (1 - seg(p, .82, .87))];
    caps.forEach(function (c, i) { c.style.opacity = cv[i].toFixed(3); c.style.transform = 'translate3d(0,' + px(10 * (1 - eo3(Math.min(1, cv[i] * 1.6)))) + ',0)'; });
    // lent: a kőív két oldalról rajzolódik, a felirat betűnként jön
    var K = seg(p, .82, 1);
    crest.style.opacity = seg(p, .82, .85).toFixed(3);
    cArch.forEach(function (a, i) { a.style.strokeDashoffset = (1 - eio(seg(p, .82 + (i > 1 ? .02 : 0), .95))).toFixed(4); });
    cKey.style.opacity = seg(p, .94, .97).toFixed(3);
    cWord.forEach(function (b, i) { var t = eo3(seg(p, .86 + i * .007, .94 + i * .007)); b.style.opacity = t.toFixed(3); b.style.transform = 'translate3d(0,' + (.34 * (1 - t)).toFixed(3) + 'em,0)'; });
    var t2 = eo3(seg(p, .92, .99));
    cSub.style.opacity = t2.toFixed(3); cRule.style.transform = 'scaleX(' + t2.toFixed(3) + ')'; cSince.style.opacity = eo3(seg(p, .95, 1)).toFixed(3);
    G.scroll = .34 * eo3(seg(p, .78, 1));
    var glWas = G.vis; G.vis = p > .66 && LE.inView; if (G.vis && (!glWas || G.ok)) kick();
    chrome();
  }
  function chrome() {
    var y = scrollY, past = !leOn ? y > LE.H * .8 : y > LE.range + vh * .6;
    hdr.classList.toggle('is-solid', past || !mnav.hidden);
    hdr.classList.toggle('hdr--ink', !past && mnav.hidden && (!leOn ? true : LE.p < .14));
    mcall.classList.toggle('show', leOn ? LE.p > .3 : y > vh * .6);
    le.classList.toggle('le-past', y > LE.range + 40);
  }
  // érintőn: az első görgetésre egyszer lejátszódik (nem követi az ujjat); a lap tetejére visszatérve visszaáll
  function filmTo(to, dur) {
    LE.film = { t0: performance.now(), from: LE.p, to: to, dur: dur * Math.abs(to - LE.p) };
    loop();
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

  /* ---------- Folyosó és tányérok mérése ---------- */
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
  var plates = $$('.plate img'), platesBox = $('.plates'), PF = [-0.07, 0.05, -0.04, 0.08], PL = [];
  function plMeasure() { PL = plates.map(function (im) { return { top: absTop(im), h: im.offsetHeight }; }); }

  /* ---------- Egy közös képkocka-ciklus: csak akkor fut, ha valami mozog ---------- */
  var raf = 0, last = 0, mouse = { x: 0, y: 0, on: false }, tilt = plates.map(function () { return { x: 0, y: 0, tx: 0, ty: 0 }; });
  function loop() { if (!raf) raf = requestAnimationFrame(tick); }
  function tick(t) {
    raf = 0;
    var dt = last ? Math.min(64, t - last) : 16; last = t;
    var k = 1 - Math.exp(-dt / 110), moving = false, y = scrollY;
    // lejárat
    if (leOn) {
      LE.inView = y < le.offsetHeight;
      if (LE.film) {
        var f = LE.film, u = f.dur ? clamp((t - f.t0) / f.dur, 0, 1) : 1;
        LE.p = lerp(f.from, f.to, u);
        if (u < 1) moving = true; else LE.film = null;
      } else if (!touch) {
        var tp = clamp(y / LE.range, 0, 1), dp = tp - LE.p;
        if (Math.abs(dp) > .0004) { LE.p += dp * k; moving = true; } else LE.p = tp;
      }
      if (LE.inView || LE.film) leRender(LE.p);
    }
    // folyosó
    if (corridor) {
      var tq = clamp((y - CO.top) / CO.range, 0, 1), dq = tq - CO.q;
      if (Math.abs(dq) > .0004) { CO.q += dq * k; moving = true; } else CO.q = tq;
      if (y + vh > CO.top - 200 && y < CO.top + CO.range + vh + 200) corRender(CO.q);
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
        var dx = tl.tx - tl.x, dy = tl.ty - tl.y;
        if (Math.abs(dx) > .01 || Math.abs(dy) > .01) { tl.x += dx * k; tl.y += dy * k; moving = true; } else { tl.x = tl.tx; tl.y = tl.ty; }
        im.style.transform = 'translate3d(0,' + px(c * PF[i]) + ',0) perspective(700px) rotateX(' + tl.y.toFixed(2) + 'deg) rotateY(' + tl.x.toFixed(2) + 'deg)';
      });
    }
    if (moving) loop(); else last = 0;
  }
  window.addEventListener('scroll', function () {
    if (leOn && touch) {
      var y = scrollY;
      if (y > 6 && LE.p < 1 && (!LE.film || LE.film.to !== 1)) filmTo(1, y > LE.range ? 500 : 3600);
      else if (LE.film && LE.film.to === 1 && y > LE.range && LE.film.dur > 600) filmTo(1, 500);
      else if (y < 2 && LE.p > 0 && (!LE.film || LE.film.to !== 0)) filmTo(0, 1400);
    }
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
  }

  /* ---------- Elérhetőség: a krém lap boltívként nyílik fel alulról, egyszer ---------- */
  var info = $('.info'), paper = $('.info__paper');
  function paperUp(now) {
    if (now || reduced) { info.classList.add('up'); return; }
    var t0 = performance.now(), W = info.offsetWidth, H = info.offsetHeight;
    (function step(t) {
      var u = eio(clamp((t - t0) / 1500, 0, 1)), w = W * (.16 + 1.1 * u), r = w / 2;
      var h = (H + r) * u, x = (W - w) / 2, y = H - h;
      paper.style.clipPath = archPath(x, y, w, h + 2);
      if (u < 1) requestAnimationFrame(step); else { paper.style.clipPath = ''; info.classList.add('up'); }
    })(t0);
  }
  if (info && 'IntersectionObserver' in window) {
    if (info.getBoundingClientRect().top < vh * .8) paperUp(true);
    else {
      var pio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { pio.disconnect(); paperUp(false); } }, { rootMargin: '0px 0px -13% 0px' });
      pio.observe(info);
    }
  } else if (info) info.classList.add('up');

  /* ---------- Nyitókép a pincében: WebGL, mélységtérkép szerinti mozgás ---------- */
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
  var G = { ok: false, push: 0, m: [0, 0], mT: [0, 0], scroll: 0, raf: 0, vis: false, drawn: '' };
  var heroImg = $('.hero__img'), l4 = $('.le__l4');
  function glInit() {
    var cv = $('.hero__gl'), im = heroImg;
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
    im.loading = 'eager';
    var dep = new Image(); dep.decoding = 'async'; dep.src = 'img/hero-melyseg.webp?v=4';
    Promise.all([im.decode ? im.decode().catch(function () {}) : null, dep.decode ? dep.decode() : new Promise(function (r) { dep.onload = r; })]).then(function () {
      if (!im.naturalWidth || !dep.naturalWidth) return;
      tex(0, im); tex(1, dep);
      gl.uniform1i(U.uI, 0); gl.uniform1i(U.uD, 1);
      gl.uniform1f(U.uAR, im.naturalWidth / im.naturalHeight); gl.uniform1f(U.uOver, 1.06);
      G.gl = gl; G.cv = cv; G.U = U; G.ok = true;
      size(); draw(); l4.classList.add('gl-on'); kick();
    }).catch(function () {});
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); G.ok = false; l4.classList.remove('gl-on'); });
  }
  function size() {
    if (!G.ok) return;
    var w = G.cv.clientWidth, h = G.cv.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    G.cv.width = Math.round(w * dpr); G.cv.height = Math.round(h * dpr);
    G.gl.viewport(0, 0, G.cv.width, G.cv.height); G.gl.uniform2f(G.U.uRes, w, h); G.drawn = '';
  }
  function draw() {
    var gl = G.gl, U = G.U, key = (G.push + G.scroll).toFixed(4) + G.m[0].toFixed(4) + G.m[1].toFixed(4);
    if (key === G.drawn) return;
    G.drawn = key;
    gl.uniform1f(U.uPush, G.push + G.scroll); gl.uniform2f(U.uM, G.m[0], G.m[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  // csak akkor rajzol, ha a pince látszik és valami mozog; utána leáll
  function glFrame() {
    G.raf = 0;
    if (!G.ok || !G.vis) return;
    var moving = false;
    for (var i = 0; i < 2; i++) {
      var dm = G.mT[i] - G.m[i];
      if (Math.abs(dm) > .0005) { G.m[i] += dm * .06; moving = true; } else G.m[i] = G.mT[i];
    }
    draw();
    if (moving) kick();
  }
  function kick() { if (!G.raf && G.ok) G.raf = requestAnimationFrame(glFrame); }
  if (canHover) {
    stage.addEventListener('pointermove', function (e) {
      G.mT[0] = (e.clientX / innerWidth - .5) * 2; G.mT[1] = (e.clientY / innerHeight - .5) * 2; kick();
    });
    stage.addEventListener('pointerleave', function () { G.mT[0] = G.mT[1] = 0; kick(); });
  }

  /* ---------- Méretek: csak szélességváltásra vagy nagy magasságváltásra mérünk újra ---------- */
  function measureAll() { vw = innerWidth; vh = innerHeight; frameMeasure(); leMeasure(); corMeasure(); flowMeasure(); plMeasure(); loop(); }
  var mw = innerWidth, mh = innerHeight;
  window.addEventListener('resize', function () {
    if (innerWidth !== mw || Math.abs(innerHeight - mh) > 160) { mw = innerWidth; mh = innerHeight; measureAll(); size(); kick(); }
  });

  /* ---------- Nyitóanimáció (WAAPI): a keret két oldalról rajzolódik, a kép előjön, a cím felúszik ---------- */
  var EX = 'cubic-bezier(.16,1,.3,1)', IOE = 'cubic-bezier(.65,0,.35,1)';
  function runIntro() {
    var list = [];
    function an(el, kf, o) { if (!el) return; list.push(el.animate(kf, Object.assign({ fill: 'both' }, o))); }
    var up = function (d) { return [{ opacity: 0, transform: 'translate3d(0,' + d + ',0)' }, { opacity: 1, transform: 'none' }]; };
    $$('.le__frame path').forEach(function (p) { an(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1700, delay: 150, easing: IOE }); });
    an(win, [{ opacity: 0 }, { opacity: 1 }], { duration: 1500, delay: 350, easing: 'cubic-bezier(.45,0,.2,1)' });
    an(L[0], [{ transform: 'scale(1.07)' }, { transform: 'none' }], { duration: 2600, delay: 350, easing: EX });
    an(key, [{ opacity: 0, transform: 'rotate(45deg) scale(.2)' }, { opacity: 1, transform: 'rotate(45deg) scale(1)' }], { duration: 700, delay: 1650, easing: EX });
    an($('.le__h1'), up('26px'), { duration: 1400, delay: 550, easing: EX });
    an($('.le__today'), up('16px'), { duration: 1300, delay: 750, easing: EX });
    an($('.le__cta'), up('16px'), { duration: 1300, delay: 880, easing: EX });
    an(hdr, [{ opacity: 0 }, { opacity: 1 }], { duration: 1100, delay: 1100, easing: 'linear' });
    an(cue, [{ opacity: 0 }, { opacity: 1 }], { duration: 1000, delay: 1900, easing: 'linear' });
    var done = function () { root.classList.remove('intro-on', 'intro-run'); root.classList.add('intro-done'); list.forEach(function (x) { x.cancel(); }); };
    Promise.all(list.map(function (x) { return x.finished; })).then(done, done);
  }
  function start() {
    var skip = !root.classList.contains('intro-on') || scrollY > 80 || !Element.prototype.animate || !leOn;
    if (skip) { root.classList.remove('intro-on'); root.classList.add('intro-done'); return; }
    root.classList.add('intro-run');
    runIntro();
  }

  measureAll();
  // középről újratöltve a lejárat már a végén áll
  if (leOn && scrollY > LE.range * .5) { LE.p = 1; leRender(1, true); }
  chrome();
  // a betűk és a ház képe megvárása (legfeljebb 1,6 mp), hogy az animáció közben semmi ne cserélődjön
  Promise.race([
    Promise.all([D.fonts ? Promise.all([D.fonts.load('400 60px Marcellus'), D.fonts.load('400 18px Karla')]) : null, haz.decode ? haz.decode().catch(function () {}) : null]),
    new Promise(function (r) { setTimeout(r, 1600); })
  ]).then(function () {
    measureAll();
    void D.body.offsetHeight;
    requestAnimationFrame(function () { requestAnimationFrame(start); });
  });
  if (D.fonts && D.fonts.ready) D.fonts.ready.then(measureAll);
  window.addEventListener('load', measureAll);
  if (!reduced && leOn) setTimeout(glInit, 400);
})();
