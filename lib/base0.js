import React from 'react';
import {View,Text} from 'react-native';

export default class extends React.Component{
    add(view){
       if(!view) 
          return(null)
       else
          return(
                {view}
          )
    }
    render(){
        const {left,top,width,height,layout}=this.props.arg;
        return(
            <View 
				style={{
                    left:left, 
                    top : top,
                    width : width,
                    height : height,
                    layout : layout}}>
               this.add()
            </View>
        )
    }
}