<template>
  <div class="container-fluid">
    <div class="mt-3 alert alert-danger" role="alert" v-if="alertMessage">
      {{ alertMessage }}
    </div>
    <h1 class="mt-3">Welcome to Genshin Impact GeoGuesser</h1>
    <button v-on:click="test">Test</button>
    <div class="row">
      <div class="col-3 text-left">
        <h3>Players : </h3>
        <ul>
          <li v-for="(player, index) in players" :key="player+'-'+index" :style="'color: '+colors[index]">
            <i class="fas fa-user"></i> {{ player.name }} - Score : {{ player.score }}
          </li>
        </ul>
        <div>
          Add a new player :
          <input type="text" v-on:keypress.enter="addPlayer($event.target)">
        </div>
      </div>
      <div class="col">
        <h3>Submit scores</h3>
        <button v-if="!submitting" v-on:click="startSubmitting" class="btn btn-primary">
          Submit new results
        </button>
        <div v-if="submitting">
          <div v-for="(player, index) in players" :key="index+'-submit'" class="border-bottom">
            <div class="row">
              <div class="col-3" :style="'color:'+colors[index]">
                {{ player.name }} =>
              </div>
              <div class="col-3">
                <div class="input-group">
                  <span class="input-group-text">X</span>
                  <input type="number" class="form-control" v-model="answers[index].x">
                </div>
              </div>
              <div class="col-3">
                <div class="input-group">
                  <span class="input-group-text">Y</span>
                  <input type="number" class="form-control" v-model="answers[index].y">
                </div>
              </div>
              <div v-if="showResults" class="col">
                Distance : {{ results[index].distance }}<br>
                Score : {{ results[index].score }}
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-2">
              Good Answer
            </div>
            <div class="col">
              <div class="input-group">
                <span class="input-group-text">X</span>
                <input type="number" class="form-control" v-model="goodAnswer.x">
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <span class="input-group-text">Y</span>
                <input type="number" class="form-control" v-model="goodAnswer.y">
              </div>
            </div>
          </div>
          <div class="text-center">
            <button 
              type="submit"
              class="btn btn-success mt-5"
              v-on:click="submitAnswers"
              v-if="!showResults"
            >
              Sumbit Results
            </button>
            <button
              class="btn btn-primary mt-5"
              v-if="submitting&&showResults"
              v-on:click="newRound"
            >
              New round
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="row" v-show="showResults">
      <div class="col text-center mt-5">
        <img width="70%" src="https://i.imgur.com/TdI4Bm1.png" id="map">
        <span 
          v-for="(player, index) in players"
          :key="'player-'+player.name+'-dot'"
          v-bind:style="{
            height: '15px',
            width: '15px',
            'background-color': colors[index],
            'border-radius': '50%',
            display: 'absolute',
            top: answers[index].showX,
            left: answers[index].showY,
          }"
        ></span>
      </div>
    </div>
  </div>
</template>

<script>
// const IMAGE_DIMENSION_X = 1792;
// const IMAGE_DIMENSION_Y = 1536;
const IMAGE_DIMENSION_RATIO = 0.7;

export default {
  name: 'Home',
  data() {
    return {
      // WebSocket
      ws: null,

      // Gameplay
      alertMessage: "",
      newPlayer: "",
      players: [],
      submitting: false,
      showResults: false,
      answers: [],
      goodAnswer: {x: 0, y: 0},
      results: [],
      colors: [
        "red",
        "blue",
        "green",
        "purple",
        "pink",
        "cyan"
      ]
    }
  },
  created() {
    console.log("Starting Connection to WebSocket Server");
    // this.ws = new WebSocket("wss://genshin-geoguesser-websocket.herokuapp.com/");
    this.ws = new WebSocket("ws://localhost:3000");

    this.ws.onopen = function (event) {
      console.log(event);
      console.log("Successfully connected to WebSocket");
    }

    this.ws.onmessage = function (event) {
      console.log(event.data);
    }
  },
  mounted() {
    },
  methods: {
    test() {
      console.log(this.ws);
      this.ws.send(JSON.stringify({ action: "increment" }));
    },
    addPlayer(e) {
      this.players.push({
        name: e.value,
        score: 0
      });
      this.answers.push({
        x: null,
        showX: 0,
        y: null,
        showY: 0,
        score: 0
      });
      e.value = "";
      this.alertMessage = "";
    },
    startSubmitting() {
      if (this.players.length == 0) {
        this.alertMessage = "Please start by adding new players";
        return;
      }
      this.submitting = true;
    },
    submitAnswers() {
      this.showResults = true;
      let self = this;
      this.answers.forEach(function (answer, index) {
        let distance = self.computeDistance(answer.x, answer.y);
        let score = self.computeScore(distance);
        self.results[index] = {distance: distance, score: score};
        self.players[index].score += score;
        self.placePoint(answer.x, answer.y, index);
      });
    },
    newRound() {
      this.results = [];
      this.answers = [];
      for (let index = 0; index < this.players.length; index++) {
        this.answers.push({
        x: null,
        showX: 0,
        y: null,
        showY: 0,
        score: 0
      });
      }
      this.showResults = false;
    },
    computeDistance(x, y) {
      let a = parseInt(this.goodAnswer.x) - parseInt(x);
      let b = parseInt(this.goodAnswer.y) - parseInt(y);

      return Math.round(Math.sqrt(a*a + b*b));
    },
    computeScore(distance) {
      return Math.round(5000 * Math.pow(0.998, distance));
    },
    placePoint(x, y, index) {
      let rect = document.getElementById('map').getBoundingClientRect();
      this.answers[index].showX = rect.left + IMAGE_DIMENSION_RATIO * x;
      this.answers[index].showY = rect.top + IMAGE_DIMENSION_RATIO * y;
    }
  },
  computed: {
  },
};
</script>

<style scoped>
</style>