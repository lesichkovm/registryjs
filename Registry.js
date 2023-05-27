function Registry(namespace) {
    var namespace =
      typeof namespace === "undefined"
        ? jsonEncode(window.location.hostname)
        : "@" + namespace;
  
    const defaultPassword =
      "8pVbaKePV3beCUZYbKSfujzucbcD3eqyJvCAUgQL8PbYe3VmAMSKC9esx8jV8M7KegPsxkDTpUKvu2UenQyPPjsDf92XnjtZh5GJRz8bQHZngNGKenKZHDD8";
  
    const password = namespace == "" ? namespace : defaultPassword;
  
    function jsonDecode(json) {
      return JSON.parse(json);
    }
  
    function jsonEncode(string) {
      return JSON.stringify(string);
    }
  
    /**
     * Gets a key from the key-vaue store, if it does not exist returns NULL
     * @param {string} key
     * @returns {Object}
     */
    this.get = function (key) {
      const keyNamespaced = key + namespace;
  
      if (localStorage.getItem(keyNamespaced) === null) {
        return null;
      }
  
      var expiresDate = localStorage.getItem(keyNamespaced + "&&expires");
      if (expiresDate === null) {
        return null;
      }
  
      const expires = new Date(expiresDate);
      const now = new Date();
      const isExpired = now.getTime() > expires.getTime() ? true : false;
  
      if (isExpired) {
        this.remove(keyNamespaced);
        return null;
      }
  
      const value = window.localStorage.getItem(keyNamespaced);
  
      if (value === null) {
        return null;
      }
  
      if (value === "undefined") {
        return null;
      }
  
      if (typeof value === "undefined") {
        return null;
      }
  
      const valueDecoded = jsonDecode(value);
      return this.decrypt(valueDecoded);
    };
    
    /**
     * Sets a value to a key
     * @param {string} key
     * @param {Object} value
     * @param {number} expires
     * @returns {void}
     */
    this.set = function (key, value, expires) {
      if (typeof value === "undefined") {
        value = null;
      }
  
      const expiresMilliseconds = typeof expires === "undefined" ? 60000000000 : expires * 1000;
      const keyNamespaced = key + namespace;
  
      if (value === null) {
        localStorage.removeItem(keyNamespaced);
        return;
      }
  
      const encValue = this.encrypt(value);
      localStorage.setItem(keyNamespaced, jsonEncode(encValue));
      const expiresTime = new Date().getTime() + expiresMilliseconds;
      const expiresDate = new Date();
      expiresDate.setTime(expiresTime);
      localStorage.setItem(keyNamespaced + "&&expires", expiresDate);
    };
  
    this.remove = function (key) {
      const keyNamespaced = key + namespace;
      localStorage.removeItem(keyNamespaced);
      localStorage.removeItem(keyNamespaced + "&&expires");
    };
  
    this.empty = function () {
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.indexOf(namespace) > -1) {
          localStorage.removeItem(key);
        }
      }
    };
  
    /**
     * Encrypts an object to a string
     * @return string
     */
    this.encrypt = function (obj) {
      const jsonString = JSON.stringify(obj);
      const passLen = password.length;
      
      const result = [];
      for (var i = 0; i < jsonString.length; i++) {
        const passOffset = i % passLen;
        const calAscii = jsonString.charCodeAt(i) + password.charCodeAt(passOffset);
        result.push(calAscii);
      }
  
      return JSON.stringify(result);
    };
  
    /**
     * Decrypts an string to the original object
     * @return object
     */
    this.decrypt = function (encStr) {
      const codesArr = JSON.parse(encStr);
      const passLen = password.length;
      
      const result = [];
      for (let i = 0; i < codesArr.length; i++) {
        const passOffset = i % passLen;
        const calAscii = codesArr[i] - password.charCodeAt(passOffset);
        result.push(calAscii);
      }
  
      let str = "";
      for (let i = 0; i < result.length; i++) {
        var ch = String.fromCharCode(result[i]);
        str += ch;
      }
  
      return JSON.parse(str);
    };
  }