const fs = require('fs');

async function fetchInstagramData() {
  const url = 'https://n8n.srv1010832.hstgr.cloud/webhook/instagramdata';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Fetch failed:', response.status);
      return;
    }
    const text = await response.text();
    fs.writeFileSync('debug_instagram_full.json', text);
    console.log('Saved to debug_instagram_full.json');
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchInstagramData();
