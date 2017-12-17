import React, { Component } from 'react';
import PullRefresh from './PullRefresh';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReachBottom: false,
      len: 50,
    };
    this.onReachBottom = this.onReachBottom.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }
  genNewsItem() {
    let { len } = this.state;
    const newsItems = [];
    while(len>0) {
      newsItems.push(len);
      len--;
    }
    return newsItems.map((item, index) => {
      return <li style={{height: '2rem'}} key={index}>{index}</li>
    })
  }
  onScroll() {
    this.setState({
      isReachBottom: false,
      isPullDown: false,
    })
  }
  getData(type) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 3000);
      console.log('getData', type);
    });
  }
  async onRefresh() {
    const { len } = this.state;
    this.setState({
      isPullDown: true,
    })
    await this.getData('pullDown').then(() => {
      this.setState({
        len: len+50,
      })
    })
  }
  async onReachBottom() {
    const { len } = this.state;
    await this.getData('pullUp').then(() => {
      this.setState({
        len: len+50,
      });
    });
  }
  render() {
    const { isReachBottom, isPullDown } = this.state;
    return (
      <PullRefresh onScroll={this.onScroll} isPullDown={isPullDown} afterPullDown={() => {this.setState({
        isPullDown: false})}} isPullDown={isPullDown} onRefresh={this.onRefresh}onReachBottom={this.onReachBottom} isReachBottom={isReachBottom}>
        <ul>{this.genNewsItem()}</ul>
      </PullRefresh>
    );
  }
}

export default App;
