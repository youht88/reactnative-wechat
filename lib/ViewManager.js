/*
 * 视图管理器
 * STEP 1:
 *   var ViewManager = require("ViewManager");
 *   var viewManager = new ViewManager();
 *   viewManager.setParent($.index)    //设置根节点,所有管理器内视图将创建在根节点上
 *
 * STEP 2:   //具体参看 add 函数
 *   viewManager.add({
 *			name : "canvas",    //全局唯一的视图名称,如果view参数为空则已name为名字创建controller
 *			position : "left",  //视图从哪里出现或出现的方式,android环境下back，hflip，vflip会统一降级为fade
 *			useTween:true,      //平移状态下是否使用缓动
 *          args : args         //传如新窗口的参数对象
 *			immediate : true    //是否直接打开，默认为false。不默认打开时可以调用 viewManager.active({name:name})
 *		});
 *   viewManager.active({
 * 	    name  : name ,     //要展现的视图名称
 *      close : false,     //是否关闭上一个视图,默认true
 *      data  : data ,     //传递给新视图的数据，在postShow中引用
 *      onlyActive : false , //为true时不移动旧视图，即旧视图作为新视图背景。如果旧视图注册为back,则缩放到backScale
 *      point.top,point.left   //左上角位置,基本不用
 *    });
 * STEP 3: 在新视图下,如上述的canvas （canvas 是使用alloy.createController创建的视图）
 *     var args = arguments[0] || {};
 *     var viewManager = args.viewManager;
 *     //定义返回按钮 如 $.back
 *     $.back.addEventListener("click",function(e){
 * 	      viewManager.back({
 * 	           close:false    //是否关闭当前视图,默认是true。如果是false则仅隐藏并不会删除该视图
 *             data:data      //定义传递给新视图的数据,将会在新视图主窗口的postShow事件中使用 e.data
 *         });
 *      });
 *     //接受若干事件
 *     $.canvas.addEventListener("postHide",function(e){...});
 *     $.canvas.addEventListener("postClose",function(e){...});
 *     $.canvas.addEventListener("preHide",function(e){...});
 *     $.canvas.addEventListener("preClose",function(e){...});
 *     $.canvas.addEventListener("postShow",function(e){...获得上一视图的参数e.data...});
 *
 */
import React from 'react';
import {View,Dimensions} from 'react-native';

import Numpad from '../imports/numpad';
import Base0 from './base0';

export default function ViewManager() {
	const platformWidth  = Dimensions.get('window').width;
	const platformHeight = Dimensions.get('window').height;
	console.warn("platformWidth,platformHeight:" + platformWidth + "," + platformHeight);

	if (!_)
		var _ = require("underscore");
	var viewManager = {
		activeName : "root",
		views : []
	};
	var parent;
	//var tween = require("tween");
	var tween = null;
	var tweenAction = null;

	var CACHETIME = 600000;

	this.setParent = function(parentView) {
		var layout = parentView.layout && parentView.layout.toLowerCase();
		if (layout == "horizontal" || layout == "vertical") {
			alert("警告:根节点窗口布局应为composite");
		}
		parent = parentView;
		//var paper = Ti.UI.createView({});
		//var paper1 =
		//Ti.UI.createView({
		//	top : 0,
		//	left : 0,
		//	width : platformWidth,
		//	height : platformHeight,
		//	zIndex : 100,
		//	backgroundColor : '#007eff',
		//	opacity : 0.2,
		//	touchEnabled : false
		//});
		//paper.add(paper1);
		//paper.hide();
		//parentView.add(paper);
		viewManager.activeName = "root";
		viewManager.views.push({
			name : "root",
			view : parent,
			backName: "root",
			cacheTime : 0,
			//paper : paper
		});
	};

	this.getManager = function() {
		return viewManager;
	};

	this.getView = function(option) {
		var name = option.name;
		var views = viewManager.views;
		var view = null;
		for (var idx = 0,
		    len = views.length; idx < len; idx++) {
			if (views[idx].name === name) {//已存在并找到
				view = views[idx];
				break;
			}
		}
		return view;
	};

	this.add = function(option) {
		/*
		 name : name,            名称（管理器中要唯一）
		 view : view,            视图对象，或视图alloy名称 默认为与name相同的alloy名称
		 position : position,    从哪里出现left,right,top,up,bottom,down,back,hflip,vflip,fade 默认为 fade
		 fromView : fromView,    如果是back,hflip,vflip，可以指定从那个视图对象中出现
		 backName : backName,    返回时出现的视图名称（默认activeName）
		 useTween : useTween,    left,right,top,bottom等平移时出现是否出现缓动
		 backScale : backScale,  back时缩放的大小比例，超过0.6时back保持。比如0.9时可以作为新视图背景
		 cacheTime : cacheTime,  缓存时间，默认10分钟。0表示永久缓存直到被删除
		 duration : duration,    动画时间，默认1秒
		 immediate : immediate         创建后是否立即激活 默认false
		 close : close           立即激活时是否关闭上一视图 默认false
		 */
		var name = option.name;
		var view = option.view || name;
		var fromView = option.fromView;
		var backName = option.backName || viewManager.activeName;
		var cacheTime = option.cacheTime || CACHETIME;
		var duration = option.duration || 200;
		var backScale = option.backScale || 0.1;
		var immediate = option.immediate || false;
		var close = option.close || false;
		//back模式下缩放的比例,0.1 ~ 0.9
		var pview;
		var have = false;
		if (!parent) {
			throw Error("请先设置parent");
		}
		if (!option.name) {
			throw Error("name 不能为空");
		}

		for (var idx = 0,
		    len = viewManager.views.length; idx < len; idx++) {
			var temp = viewManager.views[idx];
			if (temp.name === name) {//已存在并找到,替换掉
				if (temp.fromView) {
					switch(temp.position) {
					case "BACK":
						//android 下面语句有问题？
						if (Ti.Platform.osname === "android") {
							temp.pview.setTransform(Ti.UI.create2DMatrix().scale(temp.backScale, temp.backScale, 1, 1));
						} else {
							temp.pview.setTransform(Ti.UI.create2DMatrix().scale(temp.backScale, temp.backScale));
						}
						break;
					case "HFLIP":
						temp.pview.setTransform(Ti.UI.create2DMatrix().scale(-1, 1));
						break;
					case "VFLIP":
						temp.pview.setTransform(Ti.UI.create2DMatrix().scale(1, -1));
						break;
					}
				}
				if (immediate) {
					Ti.API.info("again immediate:", name);
					active({
						name : name,
						close:close
					});
				}
				return temp;
				/*remove({
				 name : name
				 });
				 */
				//break;
			}
		}

		if ( typeof view != "object") {
			var args = option.args || {};
			args = _.extend(args, {
				index : parent,
				viewManager : this
			});
			/* reactnative下的修改*/

			//var view = Alloy.createController(view, args).getView();
			var view = React.createElement(Numpad,args)
			var view = <Numpad args={args}/>
		}

		var position = (option.position || 'FADE').toUpperCase();
		if (['LEFT', 'RIGHT', 'UP', 'DOWN', 'TOP', 'BOTTOM', 'BACK', 'HFLIP', 'VFLIP', 'FADE'].indexOf(position) === -1) {
			alert("动作代码错误！");
			return;
		}

		/* reactnative下暂时关闭
		if (Ti.Platform.osname === "android") {//安卓系统降级为fade
			if (position === "HFLIP" || position === "VFLIP" || position === "BACK")
				position = "FADE";
		}
		*/
		var useTween = option.useTween || false;
		switch(position) {
		case 'FADE':
			pview = Ti.UI.createView({
				//borderColor : "red",
				left : 0,
				top : "0",
				width : platformWidth,
				height : platformHeight,
				layout : "composite",
				opacity : 0,
				visible : false,
			});
			break;
		case 'RIGHT':
			pview = Ti.UI.createView({
				//borderColor : "red",
				left : platformWidth + 1,
				top : "0",
				width : platformWidth,
				height : platformHeight,
				layout : "composite"
			});
			break;
		case 'LEFT':
			pview = <Base0 arg={{
				left : (-1) - platformWidth||(-200),
				top : "0",
				width : platformWidth||200,
				height : platformHeight||300,
				layout : "absolute"
			}}/>;
			console.warn(JSON.stringify(pview))
			break;
		case 'UP':
		case 'TOP':
			pview = Ti.UI.createView({
				left : "0",
				top : (-1) - platformHeight,
				width : platformWidth,
				height : platformHeight,
				layout : "composite"
			});
			break;
		case 'DOWN':
		case 'BOTTOM':
			pview = Ti.UI.createView({
				//borderColor : "red",
				left : "0",
				top : platformHeight + 1,
				width : platformWidth,
				height : platformHeight,
				layout : "composite"
			});
			break;
		case 'BACK':
		case 'HFLIP':
		case 'VFLIP':
			if (fromView) {
				var rect = fromView.convertPointToView({
					x : 0,
					y : 0
				}, parent);
				pview = Ti.UI.createView({
					//borderColor : "red",
					left : rect.x,
					top : rect.y,
					height : fromView.height,
					width : fromView.width,
					opacity : 0,
					layout : "composite"
				});
			} else {
				pview = Ti.UI.createView({
					//backgroundColor : "red",
					left : 0,
					top : 0,
					width : platformWidth,
					height : platformHeight,
					opacity : 0,
					layout : "composite"
				});
				//如果android系统则降级为back
				switch(position) {
				case "BACK":
					//android 下面语句有问题？
					if (Ti.Platform.osname === "android") {
						pview.setTransform(Ti.UI.create2DMatrix().scale(backScale, backScale, 1, 1));
					} else {
						pview.setTransform(Ti.UI.create2DMatrix().scale(backScale, backScale));
					}
					break;
				case "HFLIP":
					pview.setTransform(Ti.UI.create2DMatrix().scale(-1, 1));
					break;
				case "VFLIP":
					pview.setTransform(Ti.UI.create2DMatrix().scale(1, -1));
					break;
				}
			}
		}
		//var paper = Ti.UI.createView({});
		//var paper1 =
		//Ti.UI.createView({
		//	top : 0,
		//	left : 0,
		//	width : platformWidth,
		//	height : platformHeight,
		//	zIndex : 10,
		//	//backgroundColor : '#007eff',
		//	opacity : 0.2,
		//	touchEnabled : false
		//});
		//paper.add(paper1);
		//paper.hide();
		viewManager.views.push({
			name : name,
			view : view,
			pview : pview,
			position : position,
			fromView : fromView,
			backName : backName,
			useTween : useTween,
			backScale : backScale,
			cacheTime : cacheTime,
			duration : duration,
			//paper : paper
		});
		//reactnative 暂时屏蔽
		  //pview.add(view);
		  //parent.add(pview);
		  console.warn(_.keys(parent));
		
		if (immediate) {
			console.warn("new immediate:", name);
			active({
				name : name,
				close: close
			}, function() {
				return view;
			});
		}
		return view;
	};

	this.active = function(option, _callback) {
		active(option, _callback);
	};

	var active = function(option, _callback) {
		/*
		 * name      要展现的视图名称
		 * close     是否关闭上一个视图,默认true
		 * data      传入新视图的数据，在postShow中引用
		 * onlyActive 为true时不移动旧视图，即旧视图作为新视图背景。如果旧视图注册为back,则缩放到backScale
		 * point.top,point.left   左上角位置
		 */
		var views = viewManager.views;
		var index = -1,
		    view,
		    position;
		var oindex = -1,
		    oview,
		    oposition;
		var name = option.name;
		var oname;
		var onlyActive = option.onlyActive || false;
		var close = _.isBoolean(option.close) ? option.close : true;
		var data = option.data;
		//新视图在postShow事件的参数 e.data
		var point = option.point || {
			top : 0,
			left : 0
		};
		var paper,
		    opaper;
		for (var idx = 0; idx < views.length; idx++) {
			if (views[idx].name === name) {
				index = idx;
				//paper = views[index].paper;
				//Ti.API.info("paper:", name, paper);
				//paper.show();
				break;
			}
		};
		for (var idx = 0; idx < views.length; idx++) {
			if (views[idx].name === viewManager.activeName) {
				oname = views[idx].name;
				oindex = idx;
				//opaper = views[oindex].paper;
				//Ti.API.info("opaper:", oname, opaper);
				//opaper.show();
				break;
			}
		};
		console.warn("viewManager before active:", viewManager.activeName, _.pluck(viewManager.views, "name"), "index,name:", index,name, "oindex,oname:", oindex,oname);

		if (index === -1 || index === oindex) {
			console.warn("new index (" + index + ") equal to old or no such index name:" + name + " in viewManager!");
		} else {
			if (name !== "root") {//先处理新窗口
				var pview = views[index].pview;
				var fromView = views[index].fromView;
				var position = views[index].position || 'RIGHT';
				position = position.toUpperCase();
				var useTween = views[index].useTween;
				var duration = views[index].duration;
				if (position) {
					switch(position) {
					case 'LEFT':
					case 'RIGHT':
					case 'UP':
					case 'DOWN':
					case 'TOP':
					case 'BOTTOM':
						if (useTween) {
							tween.animate(pview, {
								left : point.left - pview.left,
								top : point.top - pview.top
							}, duration, tweenAction, function() {
								postShow();
							});
						} else {
							pview.animate({
								left : point.left,
								top : point.top,
								opacity : 1,
								duration : duration
							}, function() {
								postShow();
							});
						}
						break;
					case 'FADE':
						pview.visible = true;
						pview.animate({
							left : point.left,
							top : point.top,
							opacity : 1,
							duration : duration
						}, function() {
							postShow();
						});
						break;
					case 'BACK':
					case 'HFLIP':
					case 'VFLIP':
						switch(position) {
						case 'BACK':
							var transform = Ti.UI.create2DMatrix().scale(1.3, 1.3);
							break;
						case 'HFLIP':
							var transform = Ti.UI.create2DMatrix().scale(-1, 1);
							break;
						case 'VFLIP':
							var transform = Ti.UI.create2DMatrix().scale(1, -1);
							break;
						}
						if (fromView) {
							var rect = fromView.convertPointToView({
								x : 0,
								y : 0
							}, parent);
							pview.opacity = 0;
							pview.left = rect.x;
							pview.top = rect.y;

							fromView.animate({
								transform : (position == "BACK") ? null : transform,
								duration : duration / 2
							}, function() {
								pview.visible = true, pview.animate({
									left : 0,
									top : 0,
									opacity : 1,
									width : platformWidth,
									height : platformHeight,
									duration : duration / 2
								}, function() {
									postShow();
								});
							});
						} else {
							pview.visible = true;
							pview.animate({
								left : 0,
								top : 0,
								opacity : 1,
								transform : transform,
								width : platformWidth,
								height : platformHeight,
								duration : duration / 2
							}, function() {
								if (position === "BACK") {
									pview.animate({
										left : 0,
										top : 0,
										opacity : 1,
										transform : Ti.UI.create2DMatrix().scale(1, 1),
										width : platformWidth,
										height : platformHeight,
										duration : duration / 2
									}, function() {
										postShow();

									});
								} else {
									postShow();
								}
							});
						}
						break;
					}
				}
			} else {
				postShow();
			}
			function postShow() {
				viewManager.activeName = name;
				views[index].realTime = 0;
				views[index].view.fireEvent("postShow", {
					data : data
				});
				paper && paper.hide();
				_callback && _callback();
			}

		}

		if (oindex === -1 || index === oindex) {
			Ti.API.info("new index (" + index + ") equal to old or onlyActive or no such oindex name:" + viewManager.activeName + " in viewManager!");
		} else {
			if (oname !== "root") {
				var poview = views[oindex].pview;
				var fromView = views[oindex].fromView;
				var oposition = views[oindex].position;
				var ouseTween = views[oindex].useTween;
				var oduration = views[oindex].duration;
				var obackScale = views[oindex].backScale;
				if (onlyActive) {
					if (oposition.toUpperCase() === "BACK" && !fromView) {//back状态时onlyActive允许缩放到backScale
						poview.animate({
							left : 0,
							top : 0,
							width : platformWidth,
							height : platformHeight,
							transform : Ti.UI.create2DMatrix().scale(obackScale, obackScale),
							opacity : 1,
							visible : true,
							duration : oduration
						});
					}
					opaper && opaper.hide();
					return;
				}
				if (oposition) {//处理要隐藏的旧视图
					switch(oposition) {
					case 'FADE':
						poview.animate({
							opacity : 0,
							duration : oduration
						}, function() {
							poview.visible = false;
							postHide();
						});
						break;
					case 'RIGHT':
						if (ouseTween) {
							tween.animate(poview, {
								left : (platformWidth + 1) - poview.left,
							}, oduration, tweenAction, function() {
								postHide();
							});
						} else {
							poview.animate({
								left : platformWidth + 1,
								duration : oduration
							}, function() {
								postHide();
							});
						}
						break;
					case 'LEFT':
						if (ouseTween) {
							tween.animate(poview, {
								left : ((-1) - platformWidth) - poview.left,
							}, oduration, tweenAction, function() {
								postHide();
							});
						} else {
							poview.animate({
								left : (-1) - platformWidth,
								duration : oduration
							}, function() {
								postHide();
							});
						}
						break;
					case 'UP':
					case 'TOP':
						if (ouseTween) {
							tween.animate(poview, {
								top : ((-1) - platformHeight) - poview.top
							}, oduration, tweenAction, function() {
								postHide();
							});
						} else {
							poview.animate({
								top : (-1) - platformHeight,
								duration : oduration
							}, function() {
								postHide();
							});
						}
						break;
					case 'DOWN':
					case 'BOTTOM':
						if (ouseTween) {
							tween.animate(poview, {
								top : (platformHeight + 1) - poview.top
							}, oduration, tweenAction, function() {
								postHide();
							});
						} else {
							poview.animate({
								top : platformHeight + 1,
								duration : oduration
							}, function() {
								postHide();
							});
						}
						break;
					case 'BACK':
					case 'HFLIP':
					case 'VFLIP':
						switch(oposition) {
						case 'BACK':
							var transform = Ti.UI.create2DMatrix().scale(obackScale, obackScale);
							var basex = basey = 0;
							break;
						case 'HFLIP':
							var transform = Ti.UI.create2DMatrix().scale(1, 1);
							var basex = fromView && fromView.width,
							    basey = 0;
							break;
						case 'VFLIP':
							var transform = Ti.UI.create2DMatrix().scale(1, 1);
							var basex = 0,
							    basey = fromView && fromView.height;
							break;
						}
						if (fromView) {
							var rect = fromView.convertPointToView({
								x : 0,
								y : 0
							}, parent);
							poview.animate({
								left : rect.x - basex,
								top : rect.y - basey,
								width : fromView.width,
								height : fromView.height,
								transform : (oposition == "BACK") ? transform : null,
								opacity : 0,
								duration : oduration / 2
							}, function() {
								fromView.animate({
									transform : (oposition == "BACK") ? null : transform,
									duration : oduration / 2
								}, function() {
									poview.visible = false;
									postHide();
								});
							});
						} else {
							poview.animate({
								left : 0,
								top : 0,
								width : platformWidth,
								height : platformHeight,
								transform : transform,
								opacity : 0,
								duration : oduration
							}, function() {
								poview.visible = false;
								postHide();
							});
						}
						break;
					}
				}
			} else {
				postHide();
			}
			function postHide() {
				views[oindex].view.fireEvent("postHide", {
					message : views[oindex].name + " postHide ok"
				});
				opaper && opaper.hide();
				if (close) {
					views[oindex].view.fireEvent("preClose", {
						message : views[oindex].name + " preClose ok"
					});
					var backName = views[oindex].backName;
					console.warn("1",index,views[index].backName);
					views[index].backName=backName;
					console.warn("2",index,views[index].backName);
					remove({
						name : views[oindex].name
					});					
				}
			}

		}

	};

	this.remove = function(option) {
		remove(option);
	};
	function remove(option) {
		var views = viewManager.views;
		var name = option.name;

		//if (name === viewManager.activeName) {
		//	Ti.API.info(name + " is active,can not be remove!");
		//	return;
		//}
		viewManager.views = _.reject(views, function(doc) {
			if (name !== "root" && doc.name === name) {
				parent.remove(doc.pview);
				doc.view = null;
				return true;
			} else {
				return false;
			}
		});
	};

	this.back = function(option) {
		option = option || {};
		var close = _.isBoolean(option.close) ? option.close : true;
		var data = option.data;
		var index;
		var views = viewManager.views;
		for (var idx = 0; idx < views.length; idx++) {
			if (views[idx].name === viewManager.activeName) {
				index = idx;
				break;
			}
		}
		if (index >= 0) {
			var view = views[index].view;
			var backName = views[index].backName;
			var name = views[index].name;
			if (backName)
				view.fireEvent("preHide", {
					message : name + " preHide ok"
				});
			active({
				name : backName,
				close : close,
				data : data,
			}, function(e) {
			});
			//Ti.API.info(viewManager);
		}
	};

	function checkCache(time) {
		setInterval(function() {
			//Ti.API.info(viewManager);
			var views = viewManager.views;
			var backName = [];
			var delName = [];
			for (var idx in views) {
				if (views[idx].backName && backName.indexOf(views[idx].backName) === -1 && views[idx].cacheTime !== 0)
					backName.push(views[idx].backName);
			}
			//Ti.API.info(backName);
			for (var idx in views ) {
				if (backName.indexOf(views[idx].name) === -1 && viewManager.activeName != views[idx].name && delName.indexOf(views[idx].name) === -1) {
					views[idx].realTime = (views[idx].realTime || 0) + time;
					if (views[idx].realTime > views[idx].cacheTime)
						delName.push(views[idx].name);
				}
			}
			//Ti.API.info(new Date(),delName);
			for (var idx in delName) {
				remove({
					name : delName[idx]
				});
			}
		}, time);
	}

	//checkCache(60000);
}

//exports.setParent = setParent;
//exports.add = add;
//exports.active = active;
//exports.remove = remove;
//exports.getManager = getManager;
//exports.getView = getView;
//exports.back = back;
