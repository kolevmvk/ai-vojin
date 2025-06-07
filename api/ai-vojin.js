import fetch from 'node-fetch';

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
126. brigada VOJIN (Vazduhoplovnog osmatranja, javljanja i navođenja) je jedinica Ratnog vazduhoplovstva i PVO Vojske Srbije, zadužena za zaštitu vazdušnog prostora Republike Srbije.

📍 Sedište: Beograd  
👤 Komandant: pukovnik Jovica Kepčija  
📞 Telefon: +381 11 3053-282  
📧 E-pošta: cvs.126brvojin@vs.rs

🎯 Zadaci:
- Neprekidno osmatranje i kontrola vazdušnog prostora
- Otkrivanje, praćenje i identifikacija vazdušnih ciljeva
- Navođenje lovačke avijacije
- Usmeravanje PVO jedinica
- Pomoć vazduhoplovima u nuždi
- Obaveštavanje o situaciji u vazdušnom prostoru
- Održavanje radara i sistema automatizacije

🛡️ Struktura:
- Komandna četa
- 20. bataljon VOJIN
- 31. bataljon VOJIN
- Bataljon za tehničko održavanje i snabdevanje

📡 Oprema:
- AN/TPS-70
- GM-400
- GM-200
- SOVA 24
- AS-84

🏅 Dan jedinice: 12. oktobar  
Krsna slava: Sveti Petar Koriški  
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
