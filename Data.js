function extractValue(record, fieldId, listName, choiceMap) {
  function mapVal(val) {
    if (listName && choiceMap && choiceMap[listName]) {
      if (typeof val === 'string') {
        var parts = val.split(' ');
        return parts.map(function(p) { return choiceMap[listName][p] || p; }).join(', ');
      } else if (Array.isArray(val)) {
        return val.map(function(p) { return choiceMap[listName][p] || p; }).join(', ');
      }
    }
    return val;
  }

  if (record[fieldId] !== undefined && record[fieldId] !== null) {
    return mapVal(record[fieldId]);
  }
  
  for (var key in record) {
    if (Array.isArray(record[key]) && fieldId.indexOf(key + '/') === 0) {
      var values = [];
      record[key].forEach(function(repeatRow) {
        if (repeatRow[fieldId] !== undefined && repeatRow[fieldId] !== null) {
          var val = repeatRow[fieldId];
          if (typeof val === 'object' && !Array.isArray(val)) {
            values.push(JSON.stringify(val));
          } else {
            values.push(mapVal(val));
          }
        }
      });
      if (values.length > 0) {
        return values.join(', ');
      }
    }
  }
  return null;
}

function getData(request) {
  var baseUrl = getBaseUrl(request);
  var assetUid = request.configParams.asset_uid;
  var authMethod = request.configParams.auth_method;
  var preferredLanguage = request.configParams.language;
  
  var options = {
    'method': 'get',
    'headers': getAuthHeaders(request.configParams),
    'muteHttpExceptions': true
  };
  
  // Fetch asset definition for choice mappings
  var assetUrl = baseUrl + '/api/v2/assets/' + assetUid + '/';
  var assetResponse = UrlFetchApp.fetch(assetUrl, options);
  var choiceMap = {};
  var fieldListMap = {};
  
  if (assetResponse.getResponseCode() === 200) {
    var assetInfo = JSON.parse(assetResponse.getContentText());
    var survey = assetInfo.content.survey || [];
    var choices = assetInfo.content.choices || [];
    var translations = assetInfo.content.translations || [];
    
    choices.forEach(function(choice) {
      if (!choiceMap[choice.list_name]) choiceMap[choice.list_name] = {};
      choiceMap[choice.list_name][choice.name] = getLabel(choice.label, preferredLanguage, translations) || choice.name;
    });
    
    var groupStack = [];
    survey.forEach(function(item) {
      if (item.type === 'begin_group' || item.type === 'begin_repeat') {
        groupStack.push(item.name);
      } else if (item.type === 'end_group' || item.type === 'end_repeat') {
        groupStack.pop();
      } else if (item.type && item.name) {
        var fieldId = item.$autoname || (groupStack.length > 0 ? groupStack.concat([item.name]).join('/') : item.name);
        if (item.type.indexOf('select_one') === 0 || item.type.indexOf('select_multiple') === 0) {
          var parts = item.type.split(' ');
          if (parts.length > 1) {
            fieldListMap[fieldId] = parts[1];
          }
        }
      }
    });
  }
  
  var url = baseUrl + '/api/v2/assets/' + assetUid + '/data/?format=json';
  var response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    cc.newUserError()
      .setDebugText('Error fetching data from: ' + url + ' - Response: ' + response.getContentText())
      .setText('Failed to fetch data. Check your Asset UID and credentials.')
      .throwException();
  }
  
  var data = JSON.parse(response.getContentText());
  var results = data.results || [];
  
  while (data.next) {
    response = UrlFetchApp.fetch(data.next, options);
    if (response.getResponseCode() !== 200) break;
    data = JSON.parse(response.getContentText());
    if (data.results) {
      results = results.concat(data.results);
    }
  }

  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  
  var requestedFields = getFields(request).forIds(requestedFieldIds);
  
  var rows = [];
  results.forEach(function(record) {
    var row = [];
    requestedFields.asArray().forEach(function(field) {
      var fieldId = field.getId();
      var listName = fieldListMap[fieldId];
      var value = extractValue(record, fieldId, listName, choiceMap);
      
      if (value === undefined || value === null || value === '') {
        row.push('');
      } else {
        var fieldType = field.getType();
        if (fieldType === cc.FieldType.YEAR_MONTH_DAY_SECOND) {
           var date = new Date(value);
           if (!isNaN(date.getTime())) {
             row.push(Utilities.formatDate(date, 'GMT', 'yyyyMMddHHmmss'));
           } else {
             row.push('');
           }
        } else if (fieldType === cc.FieldType.YEAR_MONTH_DAY) {
           var date = new Date(value);
           if (!isNaN(date.getTime())) {
             row.push(Utilities.formatDate(date, 'GMT', 'yyyyMMdd'));
           } else {
             row.push('');
           }
        } else if (fieldType === cc.FieldType.LATITUDE_LONGITUDE) {
           var parts = String(value).split(' ');
           if (parts.length >= 2) {
             row.push(parts[0] + ',' + parts[1]);
           } else {
             row.push(value);
           }
        } else {
          if (typeof value === 'object' && !Array.isArray(value)) {
            row.push(JSON.stringify(value));
          } else {
            row.push(String(value));
          }
        }
      }
    });
    rows.push({ values: row });
  });
  
  return {
    schema: requestedFields.build(),
    rows: rows
  };
}
