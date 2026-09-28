function getFields(request) {
  var baseUrl = getBaseUrl(request);
  var assetUid = request.configParams.asset_uid;
  var authMethod = request.configParams.auth_method;
  var preferredLanguage = request.configParams.language;
  
  var url = baseUrl + '/api/v2/assets/' + assetUid + '/';
  
  var options = {
    'method': 'get',
    'headers': getAuthHeaders(request.configParams),
    'muteHttpExceptions': true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    cc.newUserError()
      .setDebugText('Error fetching schema from: ' + url + ' - Response: ' + response.getContentText())
      .setText('Failed to fetch the form schema. Check your Asset UID, Server and credentials.')
      .throwException();
  }
  
  var assetInfo = JSON.parse(response.getContentText());
  var survey = assetInfo.content.survey;
  var translations = assetInfo.content.translations || [];
  
  var fields = cc.getFields();
  var types = cc.FieldType;
  
  fields.newDimension().setId('_id').setName('ID').setType(types.TEXT);
  fields.newDimension().setId('_uuid').setName('UUID').setType(types.TEXT);
  fields.newDimension().setId('_submission_time').setName('Submission Time').setType(types.YEAR_MONTH_DAY_SECOND);
  fields.newDimension().setId('_status').setName('Status').setType(types.TEXT);
  fields.newDimension().setId('_submitted_by').setName('Submitted By').setType(types.TEXT);
  
  var groupStack = [];
  
  survey.forEach(function(item) {
    if (item.type === 'begin_group' || item.type === 'begin_repeat') {
      groupStack.push(item.name);
    } else if (item.type === 'end_group' || item.type === 'end_repeat') {
      groupStack.pop();
    } else if (item.type !== 'note' && item.name) {
      var fieldId = item.$autoname || (groupStack.length > 0 ? groupStack.concat([item.name]).join('/') : item.name);
      
      var fieldName = getLabel(item.label, preferredLanguage, translations) || item.name;
      
      var field;
      switch (item.type) {
        case 'integer':
        case 'decimal':
        case 'calculate':
          field = fields.newMetric().setType(types.NUMBER);
          break;
        case 'date':
          field = fields.newDimension().setType(types.YEAR_MONTH_DAY);
          break;
        case 'datetime':
        case 'start':
        case 'end':
          field = fields.newDimension().setType(types.YEAR_MONTH_DAY_SECOND);
          break;
        case 'geopoint':
          field = fields.newDimension().setType(types.LATITUDE_LONGITUDE);
          break;
        default:
          field = fields.newDimension().setType(types.TEXT);
      }
      field.setId(fieldId).setName(fieldName);
    }
  });
  
  return fields;
}

function getSchema(request) {
  var fields = getFields(request);
  return { 'schema': fields.build() };
}
