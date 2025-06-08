export default async function handler(req, res) {
  // 🌐 CORS – dozvoli zahteve i sa weba i iz APK-a
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ⚙️ Preflight OPTIONS zahtevi (brauzeri)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ⛔ Ako nije POST – odbaci
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  // ✅ Izvuci prompt iz tela
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid prompt field' });
  }

  // ℹ️ Staticka baza znanja o 126. brigadi VOJIN
  const info = `
126. brigada VOJIN (Vazduhoplovnog osmatranja, javljanja i navođenja) je operativna jedinica Ratnog vazduhoplovstva i PVO Vojske Srbije, zadužena za neprekidnu kontrolu i zaštitu vazdušnog prostora Republike Srbije.

📍 Sedište: Beograd – Banjica  
👤 Komandant: pukovnik Jovica Kepčija 
   Zamenik komandanta: pukovnik Miljan Milikić
   Načelnik štaba: pukovnik Perica Krbavac 
📞 Kontakt telefon: +381 11 3053-282  
📧 E-pošta: cvs.126brvojin@vs.rs  
📅 Dan jedinice: 12. oktobar  
📅 Dan službe VOJIN: 18. jun  
🎇 Krsna slava: Sveti Petar Koriški

Trka „Heroji 126. brigade VOJIN“ organizuje se u cilju očuvanja tradicije i sećanja na poginule poručnike Željka Savičića i Sinišu Radića, koji su 6. aprila 1999. godine na planini Maljen položili živote izvršavajući borbeni zadatak u odbrani otadžbine od NATO agresije.

🎯 Glavni zadaci:
- Neprekidno osmatranje i kontrola vazdušnog prostora
- Otkrivanje, identifikacija i praćenje ciljeva
- Navođenje lovačke avijacije i usmeravanje PVO jedinica
- Obaveštavanje o situaciji u vazdušnom prostoru
- Pomoć vazduhoplovima u nuždi
- Tehnička podrška radarima i sistemima automatizacije

🛡️ Organizacijska struktura:
- Komanda (Beograd)
- 20. bataljon VOJIN (Batajnica)
- 31. bataljon VOJIN (Kraljevo)
- Bataljon za tehničko održavanje i snabdevanje (Banjica)

📡 Radarska oprema:
- AN/TPS-70: američki 3D radar, domet 450 km, visina do 30.000 m
- GM-403 i GM-200 (Thales): savremeni radari srednjeg i velikog dometa

   Srdstva automatizacije:
- SOVA 24: domaći sistem za prikupljanje i obradu podataka osmatranja
- cVOJ M-11: domaći pokretni sistem za prikupljanje i obradu podataka osmatranja

📖 Istorijat:
- 18. jun 1915. – početak službe VOJIN u srpskoj vojsci
- 1955. – formirani prvi pukovi VOJIN u JNA
- 12. oktobar 1992. – osnivanje brigade spajanjem 3. i 5. puka
- 1999. – tokom NATO agresije, brigada je svih 78 dana izvršavala zadatke i odlikovana Ordenom narodnog heroja

   Obelezavanje dana 126. brigade VOJIN:
- 12. oktobar se obeležava kao Dan 126. brigade VOJIN, odnosno 12. oktobra 1992. godine je osnovana brigada

   Obeležavanje dana službe VOJIN:
- 18. jun se obeležava kao dan službe VOJIN

🎓 Obuka i kadar:
- Školovanje oficira i podoficira na Vojnoj akademiji
- Tehnička obuka za GM-403, TPS-70 i sistemima automatizacije
- Kadrovi spremni za rad u uslovima elektronskog ometanja

   Najbolji oficir u 126. brigadi VOJIN:
- kapetan Katarina Gajić je najbolji oficir 126. br VOJIN, više puta nagrađivana za postignute rezultate u radu

   Najbolji podoficir 126. brigade VOJIN:
- zastavnik I klase Sušić Žarko - Sule inače vezista

   Najbolja Šefica u 126. brigadi VOJIN:
- major Milica Bogićević je najbolja šefica u 126. brigadi VOJIN

   Ovu aplikaciju je izradio zastavnik Milan Kolev

🌍 Saradnja i interoperabilnost:
- Saradnja sa civilnom kontrolom letenja
- Učešće u vežbama Partnerstva za mir
- Povezivanje sa PVO sistemima Neva, Kub, Pantsir S1

📍 Lokacije značajnih položaja:
- Banjica (komanda)
- Banovce (GM-403)
- Murtenica / Zlatibor
- Vidojevica / Kopaonik

⚠️ Specifičnosti:
- Redundansa radarskih stanica
- Automatizovana detekcija i alarmiranje u realnom vremenu
- Podaci su edukativni, bez operativnih šifara

📥 Pridruživanje brigadi:

- Pripadnik 126. brigade VOJIN može postati lice koje ispunjava uslove za službu u Vojsci Srbije.
- Kandidat mora imati završenu srednju školu (prednost imaju tehnička i vojna usmerenja).
- Obavezno je proći osnovnu vojnu obuku ili Vojnu akademiju.
- Civilna lica mogu konkurisati preko Ministarstva odbrane na javnim konkursima.
- Profesionalni vojnici i podoficiri mogu podneti zahtev za prekomandu ako već služe u VS.
- Kontakt: cvs.126brvojin@vs.rs
`;
const infoRadari = `
📡 Karakteristike radara u 126. brigadi VOJIN:

- AN/TPS-70:
  - 3D radar američke proizvodnje
  - Domet: do 450 km
  - Visina pokrivanja: do 30.000 m
  - Frekvencijski opseg: S-band
  - Mogućnost praćenja više ciljeva istovremeno (MTI)

- GM-403:
  - Francuski radar iz Thales grupe
  - Domet: 470 km
  - Pokriva 360° azimut i 30° elevaciju
  - Visoka otpornost na ometanje
  - Kompatibilan sa NATO sistemima

- GM-200:
  - Srednjeg dometa, 3D radar za taktičku podršku
  - Brzo postavljanje i premestanje
  - Povezivanje sa PVO jedinicama

📦 Automatizovani sistemi:

- SOVA 24:
  - Domaći sistem za automatsko prikupljanje i analizu radarskih podataka
  - Radi u realnom vremenu
  - Integracija sa višim nivoima komande

- cVOJ M-11:
  - Mobilni automatizovani centar
  - Omogućava obradu i distribuciju podataka sa više radara
  - Koristi se u scenarijima brzog raspoređivanja

🛠️ Svi radari i sistemi su prilagođeni za rad u uslovima elektronskog ometanja i ometanja GPS signala.
`;


  // 🎛️ Prompt sistem
  const systemPrompt = `
Ti si Zastavnik AI – vojni asistent.

Tvoj zadatak:
- Odgovaraj ISKLJUČIVO na osnovu informacija o 126. brigadi VOJIN.
- Ako pitanje NEMA VEZE sa 126. brigadom VOJIN, odgovori TAČNO i KRATKO: "Nisam nadležan za tu temu."
- Odgovaraj isključivo na SRPSKOM jeziku, LATINIČNIM pismom.
- Odgovori moraju biti kratki, precizni, bez dodatnog tumačenja, max 3 rečenice.
- Nikad ne koristi engleske reči.

Baza znanja:
${info}
${infoRadari}
`;

  // 🔍 Detekcija pitanja o zapošljavanju
  const isRecruitmentQuestion = /kako.*(zaposlim|postanem|pridružim).*brigad/i.test(prompt);
  const userMessage = { role: 'user', content: prompt };
  const followUpMessage = {
    role: 'system',
    content: `Ako korisnik pita kako da se zaposli ili pridruži brigadi, postavi mu dodatno pitanje tipa: "Da li već imate vojnu obuku ili ste civil?", kako bi mogao preciznije da mu se odgovori.`
  };

  const messages = isRecruitmentQuestion
    ? [{ role: 'system', content: systemPrompt }, followUpMessage, userMessage]
    : [{ role: 'system', content: systemPrompt }, userMessage];

  console.log('⬅️ ZAHTEV PRIMLJEN');
  console.log('PROMPT:', prompt);
  console.log('MODEL: meta-llama/llama-4-maverick:free');
  console.log('IP:', req.headers['x-forwarded-for'] || req.socket.remoteAddress);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-maverick:free',
        messages: messages
      })
    });

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content?.trim();

    if (!output) {
      return res.status(500).json({ error: 'AI nije generisao odgovor.' });
    }

    return res.status(200).json({ output });
  } catch (error) {
    console.error('❌ Greška AI:', error);
    return res.status(500).json({ error: 'Greška u komunikaciji sa AI servisom.' });
  }
}
