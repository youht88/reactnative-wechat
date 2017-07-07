import React from 'react';
import {View,Text,StyleSheet,Animated,TouchableOpacity} from 'react-native';

import Base from './base';

export default class extends  Base{
    constructor(props){
        super(props);
    }
    
    render(){
        // 改变rotateY，rotateX来设定转轴
        const frontAnimatedStyles = {
        transform: [
            { rotateY: this.frontInterpolate },
        ]
        };
        const backAnimatedStyles = {
        transform: [
            { rotateY: this.backInterpolate }
        ]
        };
        return(
            <Base bgColor="transparent"  
                  visible={this.props.visible}
                  top={this.props.top} left={this.props.left} 
                  args = {this.props.args} >
              <View style={styles.container}>
                <Animated.View style={[styles.flipCard, frontAnimatedStyles]}>
                    <TouchableOpacity onPress={() => this._flipCard()}>
                      <Text style={[styles.flipText]}>
                        flipping front text
                      </Text>
                    </TouchableOpacity>  
                </Animated.View>
                <Animated.View style={[styles.flipCard, styles.flipCardBack, backAnimatedStyles]}>
                    <TouchableOpacity onPress={() => this._flipCard()}>
                        <Text style={[styles.flipText]}>
                        flipping back text
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
              </View>  
            </Base>
        )
    }
}  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  flipCard: {
    justifyContent: 'center',
    backgroundColor: 'blue',
    backfaceVisibility: 'hidden',
    width:"100%",
    height:"100%"
  },
  flipCardBack: {
    backgroundColor: 'red',
    position: 'absolute',
    top: 0,
  },
  flipText: {
    color: 'white',
    textAlign: 'center'
  }
});
 