import React from 'react';
import {View,Text,TouchableHighlight,
        Dimensions, Animated,DeviceEventEmitter} from 'react-native';

export default class extends React.Component{
    constructor(props){
       //console.warn("base constructor"+new Date())
       super(props);
       this.state={
        visible:this.props.visible,
        tag:this.props.tag,
        animatedValue:new Animated.Value(0)       
       } 
       this.dimension ={
            height,
            width
       } = Dimensions.get('window');
    }
    static defaultProps={args:{width:"100%",height:"100%"},
        visible:false,
        bgColor:"gray",
        body:null,
        action:"left",
        //left:0,top:0, 
    }
    _getTag(){
        return this.props.tag
    }
    _leftCard(){
     //console.warn(this.props.parent._getOwnTag())
     if (this._value >= 0.5 ){
       Animated.timing(this.state.animatedValue,{
                toValue: 0, 
            }).start();
       } else {
        //console.warn("to 0",this.props.left,this.leftInterPolate,this.state.animatedValue)
        Animated.timing(this.state.animatedValue,{
            toValue: 1,  
        }).start()
       }
    }
    _flipCard() {
    if (this._value >= 0.5) {
      Animated.timing(this.state.animatedValue, {
        toValue: 0,
        duration: 1000,
        tension: 10
      }).start();
    } else {
      Animated.timing(this.state.animatedValue, {
        toValue: 1,
        duration: 1000,
        tension: 10
      }).start();
    }
  }
    componentWillReceiveProps(nextProps){}
    shouldComponentUpdate(nextProps,nextState){return true}
    componentWillUpdate(nextProps,nextState){}
    componentDidUpdate(){}
    componentWillMount() {
        //console.warn("base componentWillMount"+new Date())

        this._value = 0;
        this.state.animatedValue.addListener(({ value }) => {
            this._value = value;
        });
        this.leftInterPolate = this.state.animatedValue.interpolate({ 
                               inputRange: [0, 1],
                               outputRange: [-(200),0]})
        this.rightInterPolate = this.state.animatedValue.interpolate({ 
                               inputRange: [0, 1],
                               outputRange: [(this.dimension.width),0]})
        this.frontInterpolate = this.state.animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
        });
        this.backInterpolate = this.state.animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '360deg']
        });
    }  
    componentDidMount(){
       this.showEvent= DeviceEventEmitter.addListener(
           "showEvent",()=>{
               switch (this.props.action) {
                   case "left":
                       this._leftCard();
                       break;
                   case "right":
                       
                       break;
                   case "flipX":
                       break;
                   case "flipY":
                      break;
                   default:
                       this._leftCard();
                       break;
               }
               this._leftCard();
        })
       // console.warn("base");
       // console.warn("base componentDidMount"+new Date())
    }
    componetWillUnMount(){
        this.showEvent.remove();
    }
    render(){
        //console.warn("base render"+new Date())
        const {visible,action,left,top,bgColor}=this.props;
        let {width,height,...other}=this.props.args;
        width = width||"100%";
        height = height || "100%";
        return(
                <Animated.View  
                  //visible={this.props.visible}
                  style={[{position:"absolute",
                          width:width,height:height,top:top,
                          backgroundColor:"transparent",
                          opacity:this.state.animatedValue,
                          left:this.leftInterPolate,
                        },other,this.props.style]}>
                  <Text style={{backgroundColor:"green"}} 
                    onPress={()=>{this._leftCard()}}>{this.props.tag}-hello-{this.state.tag}-{this._getTag()}</Text>
                  {this.props.children}
                </Animated.View>
            )
           }
    }

