/* Browser language follows the device/browser preference. Finnish only for fi locales. */
(function (global) {
  'use strict';
  const language = String(global.navigator?.language || global.navigator?.languages?.[0] || 'en');
  const lang = /^fi(?:-|$)/i.test(language) ? 'fi' : 'en';
  const messages = {
    fi: {
      eyebrow:'KENTÄLTÄ SUORAAN SINULLE',headline:'Peli elää. Seuraa mukana.',
      intro:'Tulokset, sijoitukset ja kenttien tapahtumat yhdessä paikassa.',tagline:'Oma peli. Yhteinen kenttä.',
      loading:'Ladataan…',loadingMexicano:'Ladataan Mexicano-tuloksia…',standings:'Pistetaulukko',
      player:'Pelaaja',points:'Pisteet',standingsLabel:'Pelaajien sijoitukset',roundsCourts:'Kierrokset & kentät',
      updatedInitial:'Päivitetty: –',updated:'Päivitetty:',missingId:'Turnauksen tunniste puuttuu linkistä.',
      loadError:'Turnauksen lataaminen epäonnistui.',notFound:'Turnausta ei löytynyt. Tarkista linkki.',noData:'Ei tietoja',
      roundMeta:'Kierros {current}/{total} • {points} p/ottelu',finished:'Päättynyt',live:'Live',court:'Kenttä',round:'Kierros',
      pointsPerRound:'Pisteet / kierros',courts:'Kenttiä',players:'Pelaajia',rounds:'Kierrokset',
      liveHint:'Sivu päivittyy automaattisesti, kun tulokset kirjataan GonaPadel-sovelluksessa.',
      latestRound:'Viimeisin kierros',tournamentFinished:'Turnaus päättynyt',roundStatus:'Kierros käynnissä / viimeksi pelattu',
      playing:'Pelataan',noScore:'Ei vielä tulosta',expected:'Linkin muoto',serviceError:'Palveluvirhe:',
      hide:'Piilota',show:'Näytä',finalLabel:'Turnauksen loppusijoitukset',
      finalEyebrow:'PELI PELATTU. HETKI VOITTAJILLE.',finalStandings:'Loppusijoitukset',
      thanks:'Kiitos peleistä — nähdään taas kentällä.',mascot:'Bueno-apinamaskotti',stats:'Turnauksen tilastot',
      participants:'Pelaajia / joukkueita',playedMatches:'Pelattuja otteluita',playedRounds:'Pelattuja kierroksia',playedPoints:'Pelattuja pisteitä',
      awards:'Palkintosijat',rank:'Sija',place:'{rank}. SIJA',pointsWord:'pistettä',allStandings:'Kaikki sijoitukset',
      playerTeam:'Pelaaja / joukkue',ties:'Tasapisteillä jaettu sijoitus. ±50 näytetään sovelluksen ilmoittamana.',
      emptyResults:'Pelaajien tuloksia ei ole saatavilla.'
    },
    en: {
      eyebrow:'STRAIGHT FROM THE COURT',headline:'Every point. As it happens.',
      intro:'Live scores, standings and court action, all in one place.',tagline:'Your game. Our court.',
      loading:'Loading…',loadingMexicano:'Loading Mexicano scores…',standings:'Standings',
      player:'Player',points:'Points',standingsLabel:'Player standings',roundsCourts:'Rounds & courts',
      updatedInitial:'Updated: –',updated:'Updated:',missingId:'The tournament ID is missing from the link.',
      loadError:'Unable to load the tournament.',notFound:'Tournament not found. Please check the link.',noData:'No data',
      roundMeta:'Round {current}/{total} • {points} pts/match',finished:'Finished',live:'Live',court:'Court',round:'Round',
      pointsPerRound:'Points / round',courts:'Courts',players:'Players',rounds:'Rounds',
      liveHint:'This page updates automatically when scores are entered in the GonaPadel app.',
      latestRound:'Latest round',tournamentFinished:'Tournament finished',roundStatus:'Round in progress / recently played',
      playing:'Playing',noScore:'No score yet',expected:'Link format',serviceError:'Service error:',
      hide:'Hide',show:'Show',finalLabel:'Final tournament standings',
      finalEyebrow:'MATCHES DONE. TIME TO CELEBRATE.',finalStandings:'Final standings',
      thanks:'Thanks for playing — see you back on court.',mascot:'Bueno monkey mascot',stats:'Tournament statistics',
      participants:'Players / teams',playedMatches:'Matches played',playedRounds:'Rounds played',playedPoints:'Points played',
      awards:'Podium places',rank:'Rank',place:'PLACE {rank}',pointsWord:'points',allStandings:'All standings',
      playerTeam:'Player / team',ties:'Equal points share a rank. ±50 is shown as reported by the app.',
      emptyResults:'Player results are not available.'
    }
  };
  function t(key, values = {}) {
    return (messages[lang][key] ?? messages.en[key] ?? key).replace(/\{(\w+)\}/g, (match,key) => String(values[key] ?? '–'));
  }
  global.LiveI18n = {lang,locale:lang === 'fi' ? 'fi-FI' : 'en-GB',t};
  if (!global.document) return;
  document.documentElement.lang = lang;
  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label',t(el.dataset.i18nAria)); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
})(typeof window !== 'undefined' ? window : globalThis);
