import React from "react";
import axios from "axios";
import { Radio } from "bootstrap";
// import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Panel, Well, Fade, Collapse, Button, ProgressBar } from "react-bootstrap";
import {
  faFrown,
  faSmile,
  faEye,
  faTrashAlt
} from "@fortawesome/free-solid-svg-icons";
import "../assets/css/material-kit.css";
import "../assets/css/custom.css";

import {sc, u, wallet} from "@cityofzion/neon-js";
import injectSheet from "react-jss";
import PropTypes from "prop-types";
import { injectNOS, nosProps } from "@nosplatform/api-functions/lib/react";

const styles = { 
  button: {
    margin: "16px",
    fontSize: "14px"
  }
};

const scriptHash = "312f99d643024e24e0146d731714e7f3ebe8da95"
const known_integer_keys = ["yes_counter", "no_counter"]

class Vote extends React.Component {

    hexToString (hex) {
        var string = ''; 
        for (var i = 0; i < hex.length; i += 2) {
          string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return string;
    }   

    random_id() {
      var text = "Q-";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }   

 async componentDidMount() {
    var ids = await this.get_all_questions();
    var list = []
    console.log("============================= DEBUG =============================")
    var address = await this.props.nos.getAddress()
    console.log(address)
    var encoded_address = u.reverseHex(wallet.getScriptHashFromAddress(address))
    console.log(encoded_address)
    var addr_string = this.hexToString(encoded_address)
    console.log(addr_string)
    console.log("============================= DEBUG =============================")
    for (var [id, text] of ids) {
        var q = await this.get_question(id)
        var hasVoted = false
        for (var [k, v] of q.get("voters")) {
            console.log(k + ' = ' + v);
            if ( k == addr_string ) {
                hasVoted = true
            }
        }
        list.push({"id": q.get("question_id"), "content": q.get("question"), "hasVoted": hasVoted, "totalYes": q.get("yes_counter") || 0, "totalNo": q.get("no_counter") || 0, "owner": q.get("owner"), "openStat": hasVoted})
    }
    console.log(list)

    this.setState({
      questionList: list,
      currentUser: addr_string
    });
  }


  constructor(props) {
    super(props);
    this.state = {
      inputValue: "",
      open: false,
      questionList: [],
      currentUser: "",
      showVoteResult: false
    };
  }

// =============== HELPER FUNCS ===============
    // ============================================
    handleWebsite(e) {
        this.setState({
            questionId: e.target.value
        });
    }

    handleRedirect(e) {
        this.setState({
            question: e.target.value
        });
    }

    handleMap = async func => {
        var result = await func;
        var deserial = sc.deserialize(result)
        var map = this.process_map(deserial)
        return map
    }

    process_map(d) {
        if (d.type != "Map") {
            return null
        }
        var new_map = new Map();
        var key;
        var value;
        for (var i=0; i<d.value.length; i++) {
            key = this.convert_type(d.value[i].key)
            // Handle known Integer keys as Integer (rather than ByteArray)
            if (known_integer_keys.indexOf(key) >= 0) {
                d.value[i].value.type = "Integer"
            }
            value = this.convert_type(d.value[i].value)
            new_map.set(key, value);
        }
        return new_map
    };

process_array(d) {
        if (d.type != "Array") {
            return null
        }
        var new_array = [];
        var value;
        for (var i=0; i<d.value.length; i++) {
            new_array.push(this.convert_type(d.value[i]));
        }
        return new_array
    };

    convert_type(v) {
        var value;
        if (v.type == "ByteArray") {
            value = u.hexstring2str(v.value)
        }
        if (v.type == "Integer") {
            value = parseInt(u.reverseHex(v.value), 16)
        }
        if (v.type == "Array") {
            value = this.process_array(v)
        }
        if (v.type == "Map") {
            value = this.process_map(v)
        }
        return value
    }

    handleStorage(key, enc_in, dec_out) {
        return this.props.nos.getStorage({scriptHash, key, encodeInput: enc_in, decodeOutput: dec_out});
    }

// ================ VOTE API ==================
    // ============================================

    // get specific question - returns map:
    // {"question_id": "question_id",   (string)
    //  "owner": "user_hash",           (string)
    //  "question": "question",         (string)
    //  "voters": ["user_hash"],        (string[])
    //  "yes_counter": 0,               (int)
    //  "no_counter": 0 }               (int)
    async get_question(questionId) {
        var q = await this.handleMap(this.handleStorage(questionId, true, false))
        // DEBUG
        for (var [key, value] of q) {
          console.log(key + ' = ' + value);
        }
        console.log(JSON.stringify(q, null, 4))
        return q
    }

    // get total number of yes votes - returns int
    async get_total_yes(questionId) {
        var q = await this.get_question(questionId)
        var res = q.get("yes_counter") || 0     // convert NaN to 0
        // DEBUG
        console.log(res)
        return res
    }

    // get total number of no votes - returns int
    async get_total_no(questionId) {
        var q = await this.get_question(questionId)
        var res = q.get("no_counter") || 0     // convert NaN to 0
        // DEBUG
        console.log(res)
        return res
    }

// get all questions - returns map:
    // {"questionID" : "question"}      (string)
    async get_all_questions() {
        var q = await this.handleMap(this.handleStorage("GET_ALL_QUESTIONS", true, false))
        // DEBUG
        for (var [key, value] of q) {
          console.log(key + ' = ' + value);
        }
        return q
    }

    // register question, returns txid
    async register_question(questionId, question) {
        var address = await this.props.nos.getAddress();
        console.log(address);

        var operation = "RegisterQuestion";
        var args = [address, questionId, question];
        var invoke = {
            scriptHash,
            operation,
            args};
            //encodeArgs: false };

        var txid = await this.props.nos.invoke(invoke);

        // DEBUG
        console.log(txid);
    }

// vote yes, returns txid
    async remove_question(questionId) {
        var address = await this.props.nos.getAddress();
        console.log(address);

        var operation = "RemoveQuestion";
        var args = [address, questionId];
        var invoke = {
            scriptHash,
            operation,
            args};
            //encodeArgs: false };

        var txid = await this.props.nos.invoke(invoke);

        // DEBUG
        console.log(txid);
    }

    // vote yes, returns txid
    async vote_yes(questionId) {
        var address = await this.props.nos.getAddress();
        console.log(address);

        var operation = "VoteYes";
        var args = [address, questionId];
        var invoke = {
            scriptHash,
            operation,
            args};
            //encodeArgs: false };

        var txid = await this.props.nos.invoke(invoke);

        // DEBUG
        console.log(txid);
    }

// vote no, returns txid
    async vote_no(questionId) {
        var address = await this.props.nos.getAddress();
        console.log(address);

        var operation = "VoteNo";
        var args = [address, questionId];
        var invoke = {
            scriptHash,
            operation,
            args};
            //encodeArgs: false };

        var txid = await this.props.nos.invoke(invoke);

        // DEBUG
        console.log(txid);
    }


handleSubmit = e => {
    e.preventDefault();
    console.log(this.state);
    var id = this.random_id()
    this.register_question(id, this.myinput.value)
    this.setState({
      questionList: [
        ...this.state.questionList,
        {
          id: id,
          content: this.myinput.value,
          hasVoted: true,
          totalYes: 0,
          totalNo: 0,
          openStat: false,
          owner: this.props.nos.getAddress()
        }
      ]
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
      if (str === "yes") {
        ++item.totalYes
        this.vote_yes(this.state.questionList[index].id)
      }
      else {
        ++item.totalNo
        this.vote_no(this.state.questionList[index].id)
      }
      // console.log(ty, tn);
      this.forceUpdate();
      this.setState(questionList);
    } else {
      item.openStat = !item.openStat;
      this.forceUpdate();
    }
  };

  handleDelete = index => {
    var questionList = this.state.questionList;
    var id = questionList[index].id
    this.remove_question(id)
    questionList = this.state.questionList.filter(q => q.id !== id);
    this.forceUpdate();
    this.setState({ questionList: questionList });
  };

  handleProgressbar(i) {
    return (i.totalYes / (i.totalYes + i.totalNo)).toFixed(2) * 100;
  }

  handleVote = vid => {
    console.log("here");
    window.location.reload();
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
                      const isOwner = item.owner == this.state.currentUser ? true : false;
                      return (
                        <div key={index} className="row">
                          <div className="vote-list-item">
                            <div className="col-md-1">{item.id}</div>
                            <div className="col-md-6">{item.content}</div>
                            {hasVoted ? (
                              <div className="col-md-3 text-center">
                                <FontAwesomeIcon
                                  icon={faEye}
                                  onClick={
                                    e =>
                                      this.handleCollapse(
                                        item,
                                        index,
                                        "check",
                                        e
                                      ) // this.setState({ open: !this.state.open })
                                  }
                                />
                              </div>
                            ) : (
                              <div className="col-md-3 text-center">
                                <FontAwesomeIcon
                                  icon={faSmile}
                                  onClick={
                                    e =>
                                      this.handleCollapse(item, index, "yes", e) // this.setState({ open: !this.state.open })
                                  }
                                />
                                <FontAwesomeIcon
                                  icon={faFrown}
                                  onClick={
                                    e =>
                                      this.handleCollapse(item, index, "no", e) // this.setState({ open: !this.state.open })
                                  }
                                />
                                {/* <i
                                  className="far fa-smile"
                                  onClick={
                                    e =>
                                      this.handleCollapse(item, index, "yes", e) // this.setState({ open: !this.state.open })
                                  }
                                /> */}
                                {/* <i className="far fa-frown" /> */}
                              </div>
                            )}

                            <div className="col-md-2 text-center">
                              {isOwner ? (
                                <FontAwesomeIcon
                                  icon={faTrashAlt}
                                  onClick={
                                    () => this.handleDelete(index) // this.setState({ open: !this.state.open })
                                  }
                                />
                              )  : (
                                ""
                              )}
                            </div>
                            <div className="col-md-8 ">
                              <Collapse className="collaps" in={item.openStat}>
                                <div>
                                  <Well>
                                    Total Yes: {item.totalYes} vs Total No: {item.totalNo}
                                    <ProgressBar bsStyle="success" now={this.handleProgressbar(item)} />
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

Vote.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  nos: nosProps.isRequired
};

export default injectNOS(injectSheet(styles)(Vote));
