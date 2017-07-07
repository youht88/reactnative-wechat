/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {ReactDOM} from 'react-dom';
import {
  AppRegistry,
  StyleSheet,
  Animated,
  Text,
  View,
  ScrollView,
  DeviceEventEmitter, 
} from 'react-native';


import First from './imports/first';
import Second from './imports/second';
import Third from './imports/third';

import Label from './imports/label';
import Numpad from './imports/numpad';
import * as WeChat from 'react-native-wechat'; //首先导入react-native-wechat

import ViewManager from './lib/ViewManager';

export default class wechat extends Component {
  constructor(props){
     super(props);
     //console.warn(JSON.stringify(WeChat.registerApp('wxd426dc6fb8429707')));
     this.state={
        first:true,
        second:true,
        third:true,
        value:new Animated.Value(0),
        dynamic:null,
     }
  }
  componentDidMount() {
    try {
      WeChat.registerApp('wxd426dc6fb8429707'); //从微信开放平台申请
    } catch (e) {
      console.error(e);
    }
    console.warn(JSON.stringify(WeChat));
    Animated.timing(                            // 随时间变化而执行的动画类型
        this.state.value,                      // 动画中的变量值
        {
            toValue: 1,                             // 透明度最终变为1，即完全不透明
        }
    ).start();  
   
     this.viewManager = new ViewManager();
     this.viewManager.setParent(this._index)    //设置根节点,所有管理器内视图将创建在根节点上

      /*     ReactDOM类库
      1.1 渲染ReactElement：ReactDOM.render
      1.2 移除组件：ReactDOM.unmountComponentAtNode
      1.3 查找节点：findDOMNode()
      ReactDOMServer类库
      2.1 渲染为HTML：renderToString()
      2.2 渲染为静态HTML：renderToStaticMarkup()
      React.Children类
      3.1 React.Children.map
      3.2 React.Children.forEach
      3.3 React.Children.count
      3.4 React.Children.only
      3.5 React.Children.toArray
      */
}
  _onViewManager(index){
     switch (index) {
       case 1:
         this.setState({first:!this.state.first})
          if (this.state.first) 
            //this.refs.first._leftCard(true);
            DeviceEventEmitter.emit("showEvent");
          else
            //this.refs.first._leftCard(false); 
            DeviceEventEmitter.emit("showtEvent");
         break;
       case 2:
         this.setState({second:!this.state.second})
         if (this.state.second) 
            DeviceEventEmitter.emit("showEvent");
          else
            DeviceEventEmitter.emit("showEvent");
         break;
       case 3:
         this.setState({third:!this.state.third})
         if (this.state.third) 
            DeviceEventEmitter.emit("showEvent");
          else
            DeviceEventEmitter.emit("showEvent");
         break;  
       case 4:
         this.viewManager.add({
          name : "numpad",    //全局唯一的视图名称,如果view参数为空则已name为名字创建controller
          position : "left",  //视图从哪里出现或出现的方式,android环境下back，hflip，vflip会统一降级为fade
          useTween:false,      //平移状态下是否使用缓动
          args : {a:1,b:2},         //传如新窗口的参数对象
          immediate : false    //是否直接打开，默认为false。不默认打开时可以调用 viewManager.active({name:name})
 		    });
        //const element = React.createElement(Numpad,{a:1,b:2})}

        
        break;   
       default:
         break;
     }
  }
  _testClick(){
     const element = React.createElement(Numpad,{a:1,b:2})
     ReactDOM.render(
        element,
        this._index
     );
  }
  render() {
    return (
      <View ref={(index)=>this._index=index} style={styles.page}>
        <View style={styles.container}>
          <Text style={styles.welcome} 
            onPress={() => {
                    WeChat.isWXAppInstalled()
                      .then((isInstalled) => {
                        if (isInstalled) {
                          WeChat.shareToSession({type: 'text', description: '测试微信好友分享文本!'})
                          .catch((error) => {
                            console.warn(error.message);
                          });
                        } else {
                          console.warn('没有安装微信软件，请您安装微信之后再试');
                        }
                      });
                }}
          >
            测试微信好友分享文本!
          </Text>
          <Text style={styles.instructions} onPress={()=>{WeChat.openWXApp()}}>
            打开微信
          </Text>
          <Text style={styles.instructions} 
                onPress={()=>{WeChat.sendAuthRequest("snsapi_userinfo");//在需要触发登录的时候调用
                        }}>
            微信登录
          </Text>
          <Animated.View style={{opacity:this.state.value,width:250}}>
            <Label title={this.state.first?"first:yes":"first:no"}  color="#f00" 
                   callback={()=>{this._onViewManager(1)}}/>
            <Label title={this.state.second?"second:yes":"second:no"} color="#174"     
                   callback={()=>{this._onViewManager(2)}}/>
            <Label title={this.state.third?"third:yes":"third:no"} color="#935"   
                   callback={()=>{this._onViewManager(3)}}/>
            <Label title="viewManager" color="#753"   
                   callback={()=>{this._onViewManager(4)}}/>
          </Animated.View>
        </View>
        
        <First ref="first" visible={this.state.first} action="left" left={20} top={20}
               args={{height:100}}/>
        
        <Second ref="second" visible={this.state.second} action="right" left={0} top={155} 
                args={{width:"60%" ,height:100}}/>
        <Third ref="third" visible={this.state.third} action="flipX" left={0} top={500} 
               args={{width:"80%", height:150}}/>
        
        <View style={{left:10,bottom:10,justifyContent:"center",
              alignItems:"center",height:100,width:100,backgroundColor:"red"}}>
           <Text style={{}} onPress={()=>{this._testClick()}}>Hello</Text>
        </View>
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  page:{
    width :"100%",
    height:"100%"
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('wechat', () => wechat);