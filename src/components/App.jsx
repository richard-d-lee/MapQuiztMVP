import React from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Quizzer from './Quizzer.jsx'
import SearchForm from './SearchForm.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login.jsx';
import key from './key.jsx'

var config = {
  headers: { 'Access-Control-Allow-Origin': '*' }
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      populated: 'false',
      lat: 0,
      long: 0,
      countries: [],
      currentCountry: 'Boulder, CO, USA',
      currentQuestionObj: {},
      currentQuestion: '',
      quizQuestions: [],
      currentSelection: '',
      questionCount: 0,
      showModal: false,
      correctAnswers: 0,
      visitForm: '',
      currentId: '',
      currentPass: '',
      currentPassDupe: '',
      loggedIn: false
    };
    this.onFormChange = this.onFormChange.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onAlert = this.onAlert.bind(this);
    this.onIdChange = this.onIdChange.bind(this);
    this.onPassChange = this.onPassChange.bind(this);
    this.onPassDupeChange = this.onPassDupeChange.bind(this);
    this.onLoginSubmit = this.onLoginSubmit.bind(this);
    this.onCreateSubmit = this.onCreateSubmit.bind(this);
  }


  onAlert() {
    alert(`Correct Answers:  ${this.state.correctAnswers} out of 50`)
  }

  onLoginSubmit() {
    axios.get(`http://localhost:3000/user/`, {
      params: {
        id: this.state.currentId,
        password: this.state.currentPass
      },
    })
      .then((data) => {
        if (data.data === 'yes') {
          console.log('hello')
          this.setState({ loggedIn: true })
        } else {
          console.log('uh oh!')
        }
      })
  }

  onCreateSubmit() {
    if (this.state.currentPass === this.state.currentPassDupe) {
      axios.post('/user', {
        body: {
          id: this.state.currentId,
          pass: this.state.currentPass,
        }
      })
    } else {
      alert('Your passwords do not match!')
    }
  }

  onIdChange() {
    var value = document.getElementById("formBasicId").value;
    this.setState({ currentId: value })
    console.log(this.state.currentId)
  }

  onPassChange() {
    var value = document.getElementById("formBasicPass").value;
    this.setState({ currentPass: value })
  }

  onPassDupeChange() {
    var value = document.getElementById("formBasicPassDupe").value;
    this.setState({ currentPassDupe: value })
  }

  onFormChange() {
    var nameValue = document.getElementById("formBasicSearch").value;
    this.setState({ visitForm: nameValue })
  }

  onFormSubmit() {
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${this.state.visitForm}&key=${key.key}`)
      .then((data) => {
        this.setState({
          currentCountry: data.data.results[0].formatted_address,
          lat: data.data.results[0].geometry.location.lat,
          long: data.data.results[0].geometry.location.lng
        })
      })
      .then(() => {
        var map1 = new google.maps.Map(document.getElementById("map"), {
          center: new google.maps.LatLng(this.state.lat, this.state.long),
          zoom: 11,
        });
      })
  }

  componentDidMount() {
    axios.get('https://restcountries.eu/rest/v2/all')
      .then((api) => {
        this.setState({ countries: api.data })
      });
    axios.get('https://opentdb.com/api.php?amount=50&category=22')
      .then((data) => {
        this.setState({
          quizQuestions: data.data.results,
          currentQuestionObj: data.data.results[0],
          currentQuestion: data.data.results[0].question
        }, () => {
          for (let i = 0; i < 50; i++) {
            this.state.quizQuestions[i].userChoice = '';
          }
        })
      })
      .then(() => {
        this.state.quizQuestions.push({
          question: 'Submit Your Answers!',
          correct_answer: 'Submit',
          incorrect_answers: [' ']
        })
        console.log(this.state.quizQuestions)
        this.setState({ populated: 'true' })
      })
  }

  onSubmit(answer) {
    let currentCount = this.state.questionCount;
    this.state.currentQuestionObj.userChoice = answer;
    if (this.state.questionCount < 50) {
      this.setState({
        questionCount: currentCount + 1
      }, () => {
        this.setState({
          currentQuestionObj: this.state.quizQuestions[this.state.questionCount],
          currentQuestion: this.state.quizQuestions[this.state.questionCount].question
        }, () => {
          if (this.state.questionCount === 50) {
            let finalCount = 0;
            for (let i = 0; i < this.state.quizQuestions.length; i++) {
              if (this.state.quizQuestions[i].correct_answer === this.state.quizQuestions[i].userChoice) {
                finalCount++
              }
            }
            this.setState({ correctAnswers: finalCount })
          }
        })
      })
    }
  }

  onClick() {
    let randomCountry = Math.floor(Math.random() * 250);
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${this.state.countries[randomCountry].name}&key=${key.key}`)
      .then((data) => {
        this.setState({
          currentCountry: data.data.results[0].formatted_address,
          lat: data.data.results[0].geometry.location.lat,
          long: data.data.results[0].geometry.location.lng
        })
      })
      .then(() => {
        var map1 = new google.maps.Map(document.getElementById("map"), {
          center: new google.maps.LatLng(this.state.lat, this.state.long),
          zoom: 5,
        });
      })
  }

  render() {
    if (this.state.loggedIn === true) {
      return (
        <div>
          <div className="login">
            Logged in as {this.state.currentId}
          </div>
          <div className="countryName">{this.state.currentCountry}</div>
          <div className="quizButton">
            <Quizzer
              questions={this.state.quizQuestions}
              onSubmit={this.onSubmit}
              question={this.state.currentQuestionObj}
              populated={this.state.populated}
              onAlert={this.onAlert}
              count={this.state.questionCount}
            />
            <SearchForm
              onFormChange={this.onFormChange}
              onFormSubmit={this.onFormSubmit}
            />
            <Button id="button" onClick={this.onClick}>Visit a random country!</Button>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <div className="login">
            <Login
              onIdChange={this.onIdChange}
              onPassChange={this.onPassChange}
              onPassDupeChange={this.onPassDupeChange}
              onCreateSubmit={this.onCreateSubmit}
              onLoginSubmit={this.onLoginSubmit}
            />
          </div>
          <div className="countryName">{this.state.currentCountry}</div>
          <div className="quizButton">
            <Quizzer
              questions={this.state.quizQuestions}
              onSubmit={this.onSubmit}
              question={this.state.currentQuestionObj}
              populated={this.state.populated}
              onAlert={this.onAlert}
              count={this.state.questionCount}
            />
            <SearchForm
              onFormChange={this.onFormChange}
              onFormSubmit={this.onFormSubmit}
            />
            <Button id="button" onClick={this.onClick}>Visit a random country!</Button>
          </div>
        </div>
      )
    }
  }
}

export default App;
