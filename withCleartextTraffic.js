const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withCleartextTraffic(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application[0];
    
    // Configurar usesCleartextTraffic a true
    application.$['android:usesCleartextTraffic'] = 'true';
    
    // Asegurarse de que xmlns:tools esté declarado en el manifest
    if (!androidManifest.manifest.$['xmlns:tools']) {
      androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }
    
    // Agregar tools:replace para evitar que una librería externa lo bloquee
    if (application.$['tools:replace']) {
      if (!application.$['tools:replace'].includes('android:usesCleartextTraffic')) {
        application.$['tools:replace'] += ',android:usesCleartextTraffic';
      }
    } else {
      application.$['tools:replace'] = 'android:usesCleartextTraffic';
    }

    return config;
  });
};
