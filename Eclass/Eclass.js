/**
  * @author zengwenbin
  * @email zwb461153861@sina.cn
  * @qq 461153861
  * @version 1.1.0
  * @date 2015-05-20
*/

;(function (win) {

  /****** 快捷操作  *******/
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var slice = Array.prototype.slice;

  /****** 快捷正则  *******/
  //var otherAssignExp = /this[.[](["']*)([^\1]*)\]*\1[^=]*=([^;]+);/gi, // 属性赋值正则
  var methodExp = /^function\s*[a-z]*?\s*?\([^)]+\)/i, //函数正则
      methodParamExp = /^function\s+[a-z_$\s]*?\(\s*(.*?)\)/i; //函数参数正则

  /**
    * 生成待函数执行前先执行的函数

    * @params method {Function} 待执行函数
    * @params ident {Boolean} 返回函数 false 接收参数类型包括数组 true 不包括
    * @params {Function} 先执行函数
  */
  var execBeforeSetter = function (method, ident) {
    if (!method || typeof method !== 'function') return;

    return function () {
      var args = arguments, initValue;

      if (!ident) {
        initValue = arguments[0],
        args = initValue instanceof Array ? initValue.concat(slice.call(arguments, 1)) : slice.call(arguments);  
      }
      
      return method.apply(this, args);
    };
  };

  /**
    * 自定义属性访问器

    * @params prop {String} 属性
    * @params accessor {Object} 可选项 使用这里的get方法
  */
  var defineAccessor = function (prop, accessor) {
    if (!prop) return;

    var upperProp = prop.charAt(0).toUpperCase() + prop.substring(1);
    var getter = 'get' + upperProp,
        setter = 'set' + upperProp;
    var self = typeof this === 'function' ? this.pro : this; 
    
    if (!accessor) {
      self[getter] = execBeforeSetter(function () {
        return this.propRecords[prop] == null ? String(undefined) : this.propRecords[prop];
      });
      self[setter] = execBeforeSetter(function (value) {
        this.propRecords[prop] = value;
      }, true);
    } else {
      accessor.get && (self[getter] = accessor.get);
      accessor.set && (self[setter] = accessor.set);
    }
  };

  /**
   * 对象遍历

   * @params obj {Object} 源对象
   * @params callback {String} 接收对象的key和value，处理的函数  
  */
  var eachObject = function (obj, callback) {
    if (obj instanceof Object) {

      for (var key in obj) {
        hasOwnProperty.call(obj, key) && (callback.call(obj, obj[key], key, obj));
      }
    }
  };

  /**
   * 根据普通类型转成对象的引用类型

   * @params value {Other Type} 普通类型值
   * @params {Object} 
  */
  var parseType = function (value) {
    if (value == null) return;

    var typeValue = (typeof value).toString();

    return typeValue !== 'object' && typeValue !== 'function' ? new win[typeValue.replace(/([a-z])\S*?/i, function (value, v1) {
      return v1.toUpperCase();
    })](value) : value;
  };

  /**
   * 匹配函数参数中指定参数名

   * @params obj {Object} 源对象
   * @params name {String} 指定key  
   * @params {Array}
  */
  var checkKeyword = function (method, word) {
    if (!(method instanceof Function)) return;

    var wordExp = new RegExp('^function\\s+[a-z_$]*?\\s*?\\(\\s*('+ word +').*?\\)', 'i');
    method = method.toString();

    return wordExp.test(method);
  };

  /**
    * 得到构造函数非属性赋值代码段，用以重新组织构造函数

    * @params method {Function} 被过滤函数
    * @params paramArr {Array}
    * @params {Function} 过滤后的函数字符串
  */
  var checkContent = function (method, paramArr) {
    if (!method) return '';

    if (method instanceof Function) method = method.toString();

    for (var i = 0, length = paramArr.length; i < length; i++) {
      var assignExp = new RegExp('this[.[]["\']*'+ paramArr[i] +'[^=]*=[^;]+;', 'gi');
      method = method.replace(assignExp, '');
    }

    return method.replace(methodExp, '')
                 .replace(/[{}]/g, '')
                 .replace(/^\s+|\s+$/g, '');
  };

  /**
    * 过滤数组

    * @params  array {Array} 数组
    * @params  callback {Function} 过滤函数
    * @params {Array} 处理后数组
  */
  var filter = function (array, callback) {
    var ret = [];

    if (array.filter) {
      return array.filter.call(array, callback);
    }

    for (var i = 0, length = array.length; i < length; i++) {
      callback.call(this, array[i], i, array) && (ret.push(array[i]));
    } 
    
    return ret;
  };

  /**
    * 返回外界直接调用函数，并且生成访问修饰符

    * @params value {Function} 原始函数
  */
  var checkModifier = function (value) {
    return function () {

      if (value['__modifier'] === 'private' && (arguments.callee.caller == null || (arguments.callee.caller['__caller'] !== value['__caller'] && arguments.callee.caller['__caller'] !== 'constructor'))) return;
      
      if (value['__modifier'] === 'protected' && (arguments.callee.caller == null || !arguments.callee.caller['__superClass'] && arguments.callee.caller['__caller'] !== 'constructor')) return;
        
      return value.apply(this, arguments);
    }
  };

  /**
    * 获取对象key集合

    * @params obj {Object} 原始对象
  */
  var getKeys = function (obj) {
    if (!obj) return;

    if (Object.keys) return Object.keys(obj);

    var rets = [];

    eachObject(obj, function (value, key) {
      rets.push(key);
    });

    return rets;
  };

  /**
   * 过滤对象指定key

   * @params obj {Object} 源对象
   * @params name {String} 制定key  
   * @params {Array}
  */
  var filterOptions = function (obj, name) {
    if (!obj) return;

    return filter(getKeys(obj), function (item) {
      return item !== name;
    })
  };

  /**
    * 捕获函数参数字符串表示

    * @params method {Function} 原始函数
  */
  var getMethodParam = function (method) {
    if (method instanceof Function) method = method.toString();

    return methodParamExp.exec(method) && RegExp.$1;
  };

  /**
    * 生成基类处理函数
    
    * @params method {Function} 原始函数
    * @params kclass {Function} 类
    * @params modifierName {String} 访问修饰符
  */
  var createSuperMethod = function (method, kclass, modifierName) {
    method = (function (prevMethod) {
      var reMethod;

      reMethod = execBeforeSetter(function () {
        var superClass = ( this.superClass instanceof Array
            ? this.superClass
            : typeof this.supperClass === 'function'
              ? this.superClass.pro
              : this.superClass ) 
            || Eclass.superClass;

        prevMethod['__superClass'] = superClass;
        prevMethod['__caller'] = kclass;
        prevMethod['__modifier'] = modifierName;

        return prevMethod.apply(this, (superClass instanceof Array ? superClass : [ superClass ]).concat(slice.call(arguments)));
      }); 

      reMethod['__caller'] = kclass;
      reMethod['__modifier'] = modifierName;

      return reMethod;
    })(method);

    return method;
  };

  /**
    * 添加类成员
    
    * @params obj {Object} 配置参数
    * @params kclass {Function} 类
  */
  var addClassMember = function (obj, kclass) {
    var members = filterOptions(obj, '__constructor'), memberName, modifierName, i, length;

    for (i = 0, length = members.length; i < length; i++) {
      memberName = members[i];

      eachObject(obj[memberName], function (value, key) {
      
        // 简单类型转换成各自对应的复杂类型
        value = parseType(value);

        value = (function (prevValue) {
          
          // 得到访问修饰符
          modifierName = memberName.substring(2);

          // 如果是成员值是方法
          if (typeof prevValue.valueOf() === 'function') {

            // 如果方法是包括访问父级关键字，那么重新构造构造函数
            if (checkKeyword(prevValue.valueOf(), '__super')) {
              prevValue = createSuperMethod(prevValue.valueOf(), kclass, modifierName); 
            } else {
              prevValue['__caller'] = kclass;
              prevValue['__modifier'] = modifierName;  
              prevValue['__superClass'] = ( typeof obj.superClass === 'function' ? obj.superClass.pro : obj.superClass ) || Eclass.superClass;
            }
          }

          return checkModifier(prevValue);
        })(value);

        kclass.pro[key] = value;
      });
    }

    return kclass;
  };

  /**
    * 扩展类成员

    * @params obj {Object} 扩展对象
  */
  var extendClassMember = function (obj) {
    return addClassMember(obj, this);
  };

  /**
    * 类继承

  */
  var inherit = function (superClass) {
    this.pro['superClass'] = superClass;

    return this;
  };

  /**
    * 初始化类

    * @params options {object} 关于类信息对象
  */
  var createClass = function (options) {
    if (options instanceof Function) options = { __constructor: options };

    var modifiers = filterOptions(options, '__constructor'), kclass;

    // 初始化类
    kclass = function () {
      return (execBeforeSetter(function () {

        var param = getMethodParam(options['__constructor'] || ''),
            realParams = slice.call(arguments),
            propRecords = this.propRecords = {},
            paramArr = param ? param.split(/,\s*/) : [], i, length, constructor;
        
        for (i = 0, length = paramArr.length; i < length; i++) {
          defineAccessor.call(this, paramArr[i]);
          propRecords[paramArr[i]] = realParams[i];
        }

        constructor = Function(param || '', checkContent(options['__constructor'], paramArr));
        constructor['__caller'] = 'constructor';
        
        return constructor.apply(this, arguments);
      })).apply(this, arguments); 
    };

    kclass.pro = kclass.prototype;

    // 扩展类成员
    kclass.extend = extendClassMember;
    
    // 类继承
    kclass.inherit = inherit;

    // 添加类成员
    addClassMember(options, kclass);

    // 如果基类存在，则赋予当前类的prototype
    modifiers.join('').indexOf('superClass') >= 0 && (kclass.pro['superClass'] = options['superClass']);

    return kclass;
  };

  var Eclass = {
    createClass: createClass,
    superClass: Object
  };

  this['Eclass'] = Eclass;
})(window);