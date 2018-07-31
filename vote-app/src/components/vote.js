import React from "react";
import axios from "axios";
import { Radio } from "bootstrap";
// import "./App.css";
import { Panel, Well, Fade, Collapse, Button, ProgressBar } from "react-bootstrap";

import "../assets/css/material-kit.css";
import "../assets/css/custom.css";
export default class Vote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: "",
      open: false,
      questionList: [
        {
          id: 1,
          content: "Will Nox bring us a house ?",
          hasVoted: false,
          totalYes: 35,
          totalNo: 14,
          voteFor: "Yes",
          openStat: false,
          owner: "geoff"
        },
        {
          id: 2,
          content: "Will LX bring us a house ?",
          hasVoted: true,
          totalYes: 5,
          totalNo: 4,
          voteFor: "Yes",
          openStat: false,
          owner: "michal"
        },
        {
          id: 3,
          content: "Will Nox bring us a house ?",
          hasVoted: false,
          totalYes: 115,
          totalNo: 14,
          voteFor: "Yes",
          openStat: false,
          owner: "fa"
        },
        {
          id: 4,
          content: "Will Nox bring us a house ?",
          hasVoted: true,
          totalYes: 25,
          totalNo: 44,
          voteFor: "Yes",
          openStat: false,
          owner: "edd"
        },
        {
          id: 5,
          content: "Will Nox bring us a house ?",
          hasVoted: false,
          totalYes: 65,
          totalNo: 34,
          voteFor: "Yes",
          openStat: false,
          owner: "geoff"
        }
      ],
      currentId: 6,
      showVoteResult: false
    };
  }

  /*     componentWillMount(){
            // need to get the data here
            axios.get('https://jr-001-pawpatrol-course-api.herokuapp.com/api/courses')
                .then((res)=>{
                    console.log(res);
                    this.setState(()=>{
                      return({courses:res.data})
                    });
                })
                .catch((error)=>{throw(error)});
            } */

  handleSubmit = e => {
    e.preventDefault();
    console.log(this.state);
    this.setState({
      questionList: [
        ...this.state.questionList,
        {
          id: this.state.currentId,
          content: this.myinput.value,
          hasVoted: false,
          totalYes: 315,
          totalNo: 14,
          voteFor: "Yes",
          openStat: false,
          owner: "geoff"
        }
      ],
      currentId: this.state.currentId + 1
    });
  };

  handleCollapse = (item, index, str, e) => {
    console.log(index);
    console.log(str);
    // console.log(this.state.questionList[index].openStat);
    if (item.hasVoted == false) {
      const questionList = this.state.questionList;
      item.openStat = !item.openStat;
      // this.state.questionList[index].openStat = !this.state.questionList[index]
      //   .openStat;
      item.hasVoted = true;
      // let ty = this.state.questionList[index].totalYes;
      // let tn = this.state.questionList[index].totalNo;
      str === "yes" ? ++item.totalYes : ++item.totalNo;
      // console.log(ty, tn);
      this.forceUpdate();
      this.setState(questionList);
    } else {
      item.openStat = !item.openStat;
      this.forceUpdate();
    }
  };

  handeleDelete = id => {
    id++;
    console.log("del");
    const questionList = this.state.questionList.filter(q => q.id !== id);
    console.log(questionList.length);
    this.forceUpdate();
    this.setState({ questionList: questionList });
  };

  handleVote = vid => {
    console.log("here");
    console.log(vid.totalNo);
    // this.props.totalNo++;
    // console.log(this, this.pirops.totalNo);
    // this.setState({
    //   showVoteResult: !this.state.showVoteResult
    // });
  };
  render() {
    // let totalYes = 0
    // let totalNo = 0
    // this.state.questionList.forEach((item) => {
    //     item.Status ? totalYes++ : totalNo++
    // })

    return (
      <div className="page-header header-filter">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-md-8 ml-auto mr-auto">
              <div className="card">
                <div className="card-header card-header-primary text-center">
                  <h4 className="card-title">Vote SubSystem</h4>
                </div>
                <form onSubmit={this.handleSubmit} className="centerBlock">
                  <div className="card-body">
                    <div className="row  create-vote">
                      <div className="col-md-8">
                        <input
                          type="text"
                          placeholder="New Question"
                          className="form-control"
                          ref={a => {
                            this.myinput = a;
                          }}
                          onChange={e => {
                            console.log("onchange", e.target.value);
                            this.setState({
                              inputValue: e.target.value
                            });
                          }}
                        />
                      </div>
                      <div className="col-md-4">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          onClick={this.handleSubmit}
                        >
                          Create New Question
                        </button>
                      </div>
                    </div>
                    <div className="row heading">
                      <div className="col-md-1">#</div>
                      <div className="col-md-6">Question</div>
                      <div className="col-md-3 text-center">Status</div>
                      <div className="col-md-2 text-center">Action</div>
                    </div>

                    {this.state.questionList.map((item, index) => {
                      const hasVoted = item.hasVoted;
                      const isOnwer = item.owner == "geoff" ? true : false;
                      return (
                        <div key={index} className="row">
                          <div className="vote-list-item">
                            <div className="col-md-1">{item.id}</div>
                            <div className="col-md-6">{item.content}</div>
                            {hasVoted ? (
                              <div className="col-md-3 text-center">
                                <i
                                  className="far fa-eye"
                                  onClick={
                                    e => this.handleCollapse(item, index, "check", e) // this.setState({ open: !this.state.open })
                                  }
                                />
                              </div>
                            ) : (
                              <div className="col-md-3 text-center">
                                <i
                                  className="far fa-smile"
                                  onClick={
                                    e => this.handleCollapse(item, index, "yes", e) // this.setState({ open: !this.state.open })
                                  }
                                />
                                <i
                                  className="far fa-frown"
                                  onClick={
                                    e => this.handleCollapse(item, index, "no", e) // this.setState({ open: !this.state.open })
                                  }
                                />
                              </div>
                            )}

                            <div className="col-md-2 text-center">
                              {isOnwer ? (
                                <i
                                  className="far fa-trash-alt"
                                  onClick={() => this.handeleDelete(index)}
                                />
                              ) : (
                                ""
                              )}
                            </div>
                            <div className="col-md-8 ">
                              <Collapse className="collaps" in={item.openStat}>
                                <div>
                                  <Well>
                                    Total Yes: {item.totalYes} vs Total No: {item.totalNo}
                                    <ProgressBar bsStyle="success" now={40} />
                                  </Well>
                                </div>
                              </Collapse>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
