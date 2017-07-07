import React from 'react';
import {View,Text,DeviceEventEmitter} from 'react-native';

import Base from './base';
import {_} from 'underscore'; 

export default class extends  React.Component {
    constructor(props){
        //console.warn("first constructor"+new Date())
        super(props);
        //this._args=_.extend(this.props.args,{borderWidth:1,borderColor:"red",})
        this._args = this.props.args;    
}
    componentWillMount() {
        //console.warn("first componentWillMount"+new Date())
     }
    componentDidMount(){
        //console.warn("first componentDidMount"+new Date())
        this.setState({test:1})
        this.firstEvent = DeviceEventEmitter.addListener(
            "firstEvent",()=>{
                DeviceEventEmitter.emit("testEvent");
            }
        )
    } 
    componetWillUnMount(){
        this.firstEvent.remove();
    }   
    _getTag(){
        this._getTag();
    }
    _getOwnTag(){
        return "first"
    }
    render(){
        const {visible,action,left,top,bgColor}=this.props;
        let {width,height,...other}=this.props.args;
        width = width||"100%";
        height = height || "100%";
        return(
            <Base bgColor="transparent" tag="first"
                  left={this.props.left} top={this.props.top}
                  args={this._args}
                  style={{borderWidth:1,borderColor:"red"}}
                  parent = {this} 
                 >
              <View style={{flex:1,padding:2}}>
                <View position="relative" style={{flex:1,backgroundColor:"#c9c9c9",justifyContent:"center",alignItems:"center"}}>
                  <Text onPress={()=>{this._leftCard()}}>first }</Text>
                </View>
                <View style={{flex:1,backgroundColor:"#9c9c9c"}}/>
              </View>
            </Base>
        )
    }
}   