function getAuthType() {
  var AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.NONE)
    .build();
}

function resetAuth() {
}

function isAuthValid() {
  return true;
}

function isAdminUser() {
  return false;
}

function getAuthHeaders(configParams) {
  var authMethod = configParams.auth_method;
  var headers = {};
  
  if (authMethod === 'token' && configParams.api_token) {
    headers['Authorization'] = 'Token ' + configParams.api_token;
  } else if (authMethod === 'basic' && configParams.username && configParams.password) {
    var encodedCreds = Utilities.base64Encode(configParams.username + ':' + configParams.password);
    headers['Authorization'] = 'Basic ' + encodedCreds;
  }
  
  return headers;
}
