## Eclass
***
Eclass是一个简易JavaScript *面向对象* 库，参考面向对象语言类的实现，使js能够支持构造函数、属性访问器、继承、多重继承、访问修饰符、子类访问父类公共方法或受保护方法等。

从代码结构上 使用 *Eclass* 有利于代码清晰，具有条理性，更有利于后期维护。

从模块组织上 使用 *Eclass* 进行封装代码，可以更好的和一些模块加载库结合，api清晰。

从后端配合上 使用 *Eclass* 进行开发， 能够让后端更加熟悉前端业务逻辑，后端开发前端代码更高效。

## 如何使用
***

### Eclass.createClass

快速建立一个类

#### 构造函数形式创建类

继承、扩展类成员都是以函数形式独立出来的

		Eclass.createClass(function (name, age, sex) {
			this.name = name;
			this.age = age;
			this.sex = sex;
		}) // 声明构造函数
		.inherit(a) // 继承
		.extend({
			/* 
			 * __public: 公共访问域
			 * __private: 私有访问域
			 * __protected: 受保护访问域 
			*/
			
			__public: {
        		sayName: function (__super) {
          			__super.say('123');
        		}
      		},
      		__private: {
        		sayAge: function (__super) {
          			alert(this.getAge());
        		}
      		},
      		__protected: {
        		sayMd: function () {
          			alert(this.getMd());
        		}
      		}	
		}); // 声明类成员

对象形式创建类

	var Cat = Eclass.createClass({
	  superClass: [a, b, c], // 多重继承
	  __constructor: function (name, age, sex) {
	    this.name = name;
	    this.age = age;
	    this.sex = sex;
	  },
      __public: {
        
        /* __super 调用首个父对象，首个参数名必须是__super */
        
        say: function (x) {
          this.pro(x);
          // __modifier
        }
      },
      __protected: {
        pro: function (xx) {
          alert(xx + ': bd :');
        }
      },
      __private: {
        pri: function (dd) {
          alert(dd);
        }
      } 
    });

## Api简介
***

### Eclass: Instance
通过两种方式创建实例

 * 普通类型传参
 
		var instance = new Cat('xiao ming', 22, 'boy')
 * 数组类型传参
 
		var instance = new Cat(['xiao hong', 22], 'girl')

### Eclass: Accessor
访问器

 * get读取器
   
   		instance.getName()
 * set设置器
 
   		instance.setName(value)

### Eclass: inherit
继承

 * inherit
 
   		Cat.inherit([aa, bb])

### Eclass: extend
扩展成员属性

 * extend
 		
		Cat.extend({
   		  __public: {
   		    sayName: function () {
   		      alert(this.getName());
   		    }
   		  },
   		  __private: {
   		    getR: function () {
   		      alert('getR');
   		    }
   		  },
   		  __protected: {
   		    sayAge: function () {
   		      alert(this.getAge());
   		    }
   		  }
   		});
   
### Eclass: __super
子类中第一个父类的引用（引用第一个父类，参数必须是__super）
	
 * __super
 
   		Cat.inherit([aa, bb])
   		   .extend({
   		     __public: {
   		      sayName: function (__super, __super2) {      
   		       /* 只调用父类公共方法或者受保护方法  */
   		         __super.public();
   		         __super2.protected();
   		      }
   		   }
   		});
   		   
### Eclass: __private
类私有成员（只允许在本类方法、构造方法调用，不能在全局作用域，外部函数，子类中调用）

 * __private
 
 		Cat.extend({
 		  __private: {
 		    getSum: function (x, y) {
 		      return x + y;
 		    }
 		  },
 		  __public: {
 			 logSum: function (x, y) {
 			    alert(this.getSum(x, y))
 			    this.pro(x, y);
 			 }
 		  },
 		  __protected: {
 		    pro: function (x, y) {
 		       console.log(this.getSum(x, y))
 		    }
 		  }
 		});
 		
 		
 			var cat = new Cat('w', 22);
 		
 		/* Success caller */
 		
 			cat.logSum(10, 100);
 		
 		/* Error caller */
 			
 	    	cat.getSum(10, 100);
 	    
 	    	function otherCaller () {
 	      		cat.getSum(10, 100); 
 	    	}
 	    
 	    	otherCaller();
 	    
 	    	子类调用
 		
 			

### Eclass: __protected
类私有成员（只允许在本类方法、构造方法和子类中调用，不能在全局作用域，外部函数）

 * __protected
 
 		var cat = new Cat('w', 22);
 		
 		/* Success caller */
 		
 			cat.logSum(10, 100);
 			子类调用
 		
 		/* Error caller */
 			
 	    	cat.pro(10, 100);
 	    
 	    	function otherCaller () {
 	      		cat.pro(10, 100); 
 	    	}
 	    
 	    	otherCaller();
 	    
### Eclass: __public
类私有成员（任何情况下都可以调用）

 * __public
 
 		var cat = new Cat('w', 22);
 		
 		/* Success caller */
 		
 			cat.logSum(10, 100);
 	    
 	    	function otherCaller () {
 	      		cat.logSum(10, 100); 
 	    	}
 	    
 	    	otherCaller();
 	    	
 			子类调用

	



	
	




