async function testSearch(q) {
  const url = `https://www.google.com/maps/search/${encodeURIComponent(q)}?entry=tts&g_ep=EgoyMDI2MDkyMy4wKgBIAVAD`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    console.log('Final URL for', q, '->', res.url);
    const m = res.url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (m) {
      console.log('Found coords in URL: lat =', m[1], 'lng =', m[2]);
    }
    const hex = res.url.match(/1s(0x[0-9a-f]+:0x[0-9a-f]+)/);
    if (hex) {
      console.log('Found hex place ID:', hex[1]);
    }
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await testSearch("Domino's Pizza 7515 Al Imam Abdul Aziz St, Al Faisaliyyah, Jeddah");
  await testSearch("Domino's Pizza 6802 Abi Dharr Al Ghifari St, Al Naseem, Jeddah");
}
run();
