var cc = DataStudioApp.createCommunityConnector();

function getLabel(labelObj, preferredLanguage, translationsArray) {
  if (!labelObj) return "";
  if (typeof labelObj === 'string') return labelObj;
  
  if (Array.isArray(labelObj)) {
    if (preferredLanguage && translationsArray) {
      var langIndex = translationsArray.indexOf(preferredLanguage);
      if (langIndex !== -1 && labelObj[langIndex] !== undefined) {
        return labelObj[langIndex];
      }
    }
    return labelObj[0]; 
  }
  
  if (typeof labelObj === 'object') {
    if (preferredLanguage && labelObj[preferredLanguage] !== undefined) {
      return labelObj[preferredLanguage];
    }
    var keys = Object.keys(labelObj);
    if (keys.length > 0) return labelObj[keys[0]];
  }
  
  return String(labelObj);
}
