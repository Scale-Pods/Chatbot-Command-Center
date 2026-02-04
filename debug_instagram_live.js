const fs = require('fs');

async function debugInstagram() {
  try {
    const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/instagramdata");
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

debugInstagram();
