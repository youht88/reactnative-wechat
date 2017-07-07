import React from 'react';
import {View,Text,Animated} from 'react-native';

import Base from './base';

export default class extends  Base{
    constructor(props){
        super(props);
    }
    
    render(){
        return(
            <Base bgColor="transparent"  
                  visible={this.props.visible}
                  top={this.props.top} 
                  args={this.props.args}>
               <Animated.View style={{flex:1,padding:2,flexDirection:"row",
                                      left:this.leftInterPolate}}>
                <View style={{flex:1,backgroundColor:"red",justifyContent:"center",alignItems:"center"}}>
                  <Text >second</Text>
                </View>
                <View style={{flex:1,margin:20,backgroundColor:"yellow"}}/>
              </Animated.View>
            </Base>
        )
    }
}   