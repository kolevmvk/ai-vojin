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
🎇 Krsna slava: Sveti Petar Koriški

🎯 Glavni zadaci:
- Neprekidno osmatranje i kontrola vazdušnog prostora
- Otkrivanje, identifikacija i praćenje vazdušnih ciljeva
- Navođenje lovačke avijacije i usmeravanje PVO jedinica
- Obaveštavanje o situaciji u vazdušnom prostoru
- Pomoć vazduhoplovima u nuždi
- Održavanje radarskih i automatizovanih sistema

🛡️ Organizacijska struktura:
- Komanda (Beograd)
- 20. bataljon VOJIN (Batajnica)
- 31. bataljon VOJIN (Kraljevo )
- Bataljon za tehničko održavanje i snabdevanje (Banjica)

📡 Radarska oprema:
- AN/TPS-70: američki 3D radar, domet 450 km, visina do 30.000 m
- GM-403 i GM-200 (Thales): savremeni radari srednjeg i velikog dometa
- SOVA 24: domaći taktički radar za niske visine
- AS-84: mobilni sistem iz SFRJ sa mogućnostima zamene položaja

📖 Istorijat:
- Jedinica je formirana 1955. godine.
- Tokom NATO agresije 1999. godine, igrala ključnu ulogu u otkrivanju i javljanju o ciljevima.
- Učestvovala u sistemu pasivne detekcije i preživljavanja putem premestivih radarskih stanica.

🎓 Obuka i kadar:
- Oficiri i podoficiri školuju se na Vojnoj akademiji i VTI sistemima
- Tehničko osoblje prolazi dodatne kurseve za GM-403 i TPS-70
- Posade su obučene za rad u uslovima elektronskog ometanja i noćnim operacijama

🌍 Saradnja i interoperabilnost:
- Saradnja sa civilnom kontrolom letenja kroz razmenu radarskih podataka
- Učestvovanje u međunarodnim vežbama kroz program Partnerstvo za mir
- Mogućnost integracije sa sistemima NATO interoperabilnog formata

📍 Lokacije značajnih radarskih položaja:
- Banjica (komanda i )
- Banovce (GM-403)
- Murtenica / Zlatibor (otkrivanje iz pravca juga)
- Vidojevica / Kopaonik (dominantne visine za osmatranje)

⚠️ Tehničke specifičnosti:
- Sistem redundanse – prekid u radu jednog položaja ne remeti sistem
- Automatizovani sistem za detekciju i alarmiranje u realnom vremenu
- Mogućnost povezivanja sa PVO sistemima tipa Neva, Kub, i Pantsir S1

🔒 Napomena:
Podaci su prilagođeni za edukativne i informativne svrhe u okviru Zastavnik AI sistema. Operativni detalji i šifre nisu deo javne baze znanja.
`;

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
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
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
