import React from 'react';
import {View,Text} from 'react-native';


export default class extends React.Component{
    constructor(props){
        super(props);
        this.state={
            title:"hello world!"
        }

    }
    componentDidMount(){
    }
    _onPress(){
        console.warn("hello!")
    }
    _numpad(){
       return <View ref={(view)=>{this._view = view}} style={{position:"absolute",backgroundColor:"#ddd",marginTop:40,marginLeft:20}}>
             <Text ref="text" onPress={this._onPress}>{this.state.title}</Text>
       </View>
    }
    render(){
        return(
            this._numpad()
        )
    }
} 