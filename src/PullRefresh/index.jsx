import React, { Component } from "react";
import "./pullrefresh.css";
class PullRefresh extends Component {
  constructor(props) {
    super(props);
    const { dragThreshold, moveCount } = this.props;
    this.state = {
        isReachBottom: false,
        isPullDown: false,
    };
    this.dragThreshold = dragThreshold;
    this.moveCount = moveCount;
    this.dragStart = null;
    this.percentage = 0;
    this.changeOnceFlag = 0;
    this.joinRefreshFlag = null;
    this.refreshFlag = 0;
    this.scrollHandler = this.scrollHandler.bind(this);
    this._touchStart = this._touchStart.bind(this);
    this._touchMove = this._touchMove.bind(this);
    this._touchEnd = this._touchEnd.bind(this);
  }
  checkIsReachBottom(info = {}) {
    const { scrollHeight, clientHeight, scrollTop, reachBottomOffset } = info;
    return (
      Math.ceil(scrollTop) + clientHeight + reachBottomOffset >= scrollHeight
    );
  }
  scrollHandler(e) {
    const { reachBottomOffset, onReachBottom, onScroll } = this.props;
    const { scrollHeight, clientHeight, scrollTop } = e.target;
    if (typeof onScroll === 'function') {
        onScroll();
    }
    if (
      this.checkIsReachBottom({
        scrollHeight,
        clientHeight,
        scrollTop,
        reachBottomOffset
      })
    ) {
        this.setState({
            isReachBottom: true,
        });
      onReachBottom().then(() => {
        this.setState({
            isReachBottom: false,
        })
      })
    } else {
        this.setState({
            isReachBottom: false,
        })
    }
  }
  componentDidMount() {
    this._container.addEventListener("touchstart", this._touchStart, false);
    this._container.addEventListener("touchmove", this._touchMove, false);
    this._container.addEventListener("touchend", this._touchEnd, false);
  }
  _touchStart(e) {
    if (this.refreshFlag) {
      e.preventDefault();
      return;
    }
    this.dragStart = e.changedTouches[0].clientY;
    this._container.style.webkitTransition = "none";
    this._pullIcon.classList.add("none");
  }
  _touchMove(e) {
    console.log("move", this.dragStart);
    const self = this;
    const { beforePullDown } = this.props;
    if (this.dragStart == null) {
      return;
    }
    if (this.refreshFlag) {
      e.preventDefault();
      return;
    }
    const target = e.changedTouches[0];
    this.percentage = (this.dragStart - target.clientY) / window.screen.height;
    if (document.body.scrollTop === 0) {
      if (this.percentage < 0) {
        e.preventDefault();
        if (!this.changeOnceFlag) {
          beforePullDown();
          this.changeOnceFlag = 1;
        }
        const translateX = -this.percentage * this.moveCount;
        this.joinRefreshFlag = true;
        if (Math.abs(this.percentage) > this.dragThreshold) {
          this.setState({
            stateText: "释放刷新"
          });
        } else {
          this.setState({
            stateText: "下拉刷新"
          }, () => {
            self._pullRefresh.classList.remove('none');
          });
        }
        if (this.percentage > 0) {
          this._container.style.webkitTransform = `translate3d(0,${translateX}px,0`;
        }
      } else {
        if (`${this.joinRefreshFlag}` === "null") {
          this.joinRefreshFlag = false;
        }
      }
    } else {
      if (!this.joinRefreshFlag) {
        this.joinRefreshFlag = false;
      }
    }
  }
  async _touchEnd(e) {
    console.log("end", this.percentage);
    const self = this;
    const { afterPullDown, onRefresh } = this.props;
    if (this.percentage === 0) {
      return;
    }
    if (this.refreshFlag) {
      e.preventDefault();
      return;
    }
    if (
      Math.abs(this.percentage) > this.dragThreshold && this.joinRefreshFlag
    ) {
        this.setState({
            stateText: "正在刷新..",
        });
      onRefresh().then(() => {});
      this._pullRefresh.style.marginTop = "0";
      this._pullIcon.classList.remove("none");
      this._container.style.webkitTransition = "330ms";
      this._container.style.webkitTransform = `translate3d(0,${0}px,0`;
      this.refreshFlag = 1;
      setTimeout(() => {
        self.setState({
          stateText: "刷新成功",
        }, () => {
          self._container.style.webkitTransfor = "translate3d(0, 0, 0)";
          setTimeout(() => {
            afterPullDown();
            self.refreshFlag = 0;
            self._pullRefresh.classList.add('none');
            self._pullIcon.classList.add("none");
          }, 300);
        }, 2000);
        });
    } else {
      if (this.joinRefreshFlag) {
        this.refreshFlag = 1;
        this._container.style.webkitTransition = "330ms";
        this._container.style.webkitTransform = "translate3d(,0 0, 0)";
        setTimeout(() => {
          afterPullDown();
          self.refreshFlag = 0;
        }, 300);
      }
    }
    this.changeOnceFlag = 0;
    this.joinRefreshFlag = null;
    this.dragStart = null;
    this.percentage = 0;
  }
  render() {
    const { children } = this.props;
    const { isReachBottom } = this.state;
    const { stateText } = this.state;
    return (
      <div
        className="wrapper"
        ref={node => this._container = node}
        onScroll={this.scrollHandler}
      >
      <div
          className="pullrefresh-down"
          ref={node => this._pullRefresh = node}
        >
          <div className="spinner" ref={node => this._pullIcon = node} />
          <span>{stateText}</span>
        </div>
        {children}
        <div
          className="pullrefresh-loadMore"
          style={{
            visibility: isReachBottom ? "visible" : "hidden"
          }}
        >
          <img
            src="//mat1.gtimg.com/www/js/news/pull-up-alpha.gif"
            alt="上拉刷新"
          />
          <span
            style={{
              fontSize: "14px",
              marginLeft: "5px"
            }}
          >
            正在加载数据
          </span>
        </div>
      </div>
    );
  }
}

PullRefresh.defaultProps = {
  reachBottomOffset: 100,
  onReachBottom: () => {},
  dragThreshold: 0.1,
  moveCount: 200,
  beforePullDown: () => {},
  afterPullDown: flag => {},
  onRefresh: () => {
    console.log("refresh");
  }
};

export default PullRefresh;
