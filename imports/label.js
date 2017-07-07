  import React from 'react';
  import {View,Text} from 'react-native';

  import Color from 'color';

  export default class extends React.Component{
      static defaultProps={
        color:"#555",
        bgColor:"#555a",
        title:"",
        callback:function(){console.warn("not define function.")}
    }
      render(){
          let bgColor=Color(this.props.color).lighten(0.7);
          return(
            <View style={{width:"100%",margin:5,
                          borderLeftColor:this.props.color,
                          borderLeftWidth:5,
                          backgroundColor:bgColor
                        }}>
              <Text style={{padding:5,fontSize:16}} onPress={this.props.callback}>{this.props.title}</Text>
            </View>
          )
      }
  }
