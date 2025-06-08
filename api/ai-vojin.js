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

📍 Sedište: Beograd – Zemun  
👤 Komandant: pukovnik Jovica Kepčija  
📞 Kontakt telefon: +381 11 3053-282  
📧 E-pošta: cvs.126brvojin@vs.rs  
📅 Dan jedinice: 12. oktobar  
📅 Dan službe VOJIN: 18. jun  
🎇 Krsna slava: Sveti Petar Koriški

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
- SOVA 24: domaći taktički radar za niske visine
- AS-84: mobilni sistem iz SFRJ sa mogućnostima zamene položaja

📖 Istorijat:
- 18. jun 1915. – početak službe VOJIN u srpskoj vojsci
- 1955. – formirani prvi pukovi VOJIN u JNA
- 12. oktobar 1992. – osnivanje brigade spajanjem 3. i 5. puka
- 1999. – tokom NATO agresije, brigada je svih 78 dana izvršavala zadatke i odlikovana Ordenom narodnog heroja

🎓 Obuka i kadar:
- Školovanje oficira i podoficira na Vojnoj akademiji
- Tehnička obuka za GM-403, TPS-70 i noćni rad
- Kadrovi spremni za rad u uslovima elektronskog ometanja

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
