function getConfig(request) {
  var config = cc.getConfig();
  
  var server = request.configParams && request.configParams.server;
  var authMethod = request.configParams && request.configParams.auth_method;
  var assetUid = request.configParams && request.configParams.asset_uid;
  var language = request.configParams && request.configParams.language;

  var hasAuth = false;
  if (request.configParams) {
    hasAuth = (authMethod === 'token' && request.configParams.api_token) || 
              (authMethod === 'basic' && request.configParams.username && request.configParams.password);
  }
  
  var formLanguages = [];
  var needsLanguageChoice = false;
  
  if (server && hasAuth && assetUid) {
    formLanguages = getKoboLanguages(server, request.configParams, assetUid);
    if (formLanguages.length > 1) {
      needsLanguageChoice = true;
    }
  }

  var isComplete = false;
  if (server && hasAuth && assetUid) {
    if (needsLanguageChoice) {
      isComplete = !!language;
    } else {
      isComplete = true;
    }
  }

  if (!isComplete) {
    config.setIsSteppedConfig(true);
  }

  config.newInfo()
    .setId('instructions')
    .setText('Configure your KoboToolbox connection. Select your server and auth method, then enter your credentials.');

  config.newSelectSingle()
    .setId('server')
    .setName('KoboToolbox Server')
    .addOption(config.newOptionBuilder().setLabel('Global (kf.kobotoolbox.org)').setValue('https://kf.kobotoolbox.org'))
    .addOption(config.newOptionBuilder().setLabel('EU (eu.kobotoolbox.org)').setValue('https://eu.kobotoolbox.org'));

  config.newSelectSingle()
    .setId('auth_method')
    .setName('Authentication Method')
    .addOption(config.newOptionBuilder().setLabel('API Key / Token').setValue('token'))
    .addOption(config.newOptionBuilder().setLabel('Username & Password').setValue('basic'))
    .setIsDynamic(true);

  if (authMethod === 'token') {
    config.newTextInput()
      .setId('api_token')
      .setName('API Key / Token')
      .setHelpText('Paste your KoboToolbox API token.');
  } else if (authMethod === 'basic') {
    config.newTextInput()
      .setId('username')
      .setName('Username');
      
    config.newTextInput()
      .setId('password')
      .setName('Password');
  }

  if (server && hasAuth) {
    var forms = getKoboForms(server, request.configParams);
    if (forms.length > 0) {
      var formSelect = config.newSelectSingle()
        .setId('asset_uid')
        .setName('Select Form (Asset)')
        .setIsDynamic(true);
        
      forms.forEach(function(form) {
        formSelect.addOption(config.newOptionBuilder().setLabel(form.name).setValue(form.uid));
      });
    } else {
      config.newInfo()
        .setId('no_forms')
        .setText('No forms found or authentication failed. Check your credentials and server.');
      
      config.newTextInput()
        .setId('asset_uid')
        .setName('Asset UID (Manual Entry)')
        .setIsDynamic(true);
    }
  }
  
  if (needsLanguageChoice) {
    var langSelect = config.newSelectSingle()
      .setId('language')
      .setName('Form Language (for labels & values)')
      .setHelpText('Choose the language to use for column names and dropdown values.');
      
    formLanguages.forEach(function(lang) {
      langSelect.addOption(config.newOptionBuilder().setLabel(lang).setValue(lang));
    });
  }

  return config.build();
}

function getKoboLanguages(server, configParams, assetUid) {
  var url = server + '/api/v2/assets/' + assetUid + '/';
  var options = {
    'method': 'get',
    'headers': getAuthHeaders(configParams),
    'muteHttpExceptions': true
  };
  try {
    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      var data = JSON.parse(response.getContentText());
      if (data.content && data.content.translations) {
        return data.content.translations;
      }
    }
  } catch (e) {}
  return [];
}

function getKoboForms(server, configParams) {
  var url = server + '/api/v2/assets/?format=json';
  var options = {
    'method': 'get',
    'headers': getAuthHeaders(configParams),
    'muteHttpExceptions': true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      var data = JSON.parse(response.getContentText());
      var results = data.results || [];
      return results.map(function(asset) {
        return {
          name: asset.name || asset.uid,
          uid: asset.uid
        };
      });
    }
  } catch (e) {
  }
  return [];
}

function getBaseUrl(request) {
  var server = request.configParams.server;
  if (server && server.endsWith('/')) {
    server = server.slice(0, -1);
  }
  return server;
}
