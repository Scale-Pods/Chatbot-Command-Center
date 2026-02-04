const fs = require('fs');

async function fetchWebsiteData() {
  const url = 'https://n8n.srv1010832.hstgr.cloud/webhook/493e8a5a-417b-4bef-81ba-49c83069c86d';
  try {
    const response = await fetch(url);
    const text = await response.text();
    fs.writeFileSync('debug_website_users.json', text);
    console.log('Saved to debug_website_users.json');
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchWebsiteData();
