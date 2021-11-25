<template>
  <div class="container-fluid">
    <div class="mt-3 alert alert-danger" role="alert" v-if="alertMessage">
      {{ alertMessage }}
    </div>
    <h1 class="mt-3">Welcome to Genshin Impact GeoGuesser</h1>
    <button v-on:click="resetValues()">Reset</button>
    <div class="row">
      <div class="col-3 text-left">
        <h3>Players : </h3>
        <ul>
          <li v-for="(player, index) in players" :key="player+'-'+index" :style="'color: '+colors[index]">
            <i class="fas fa-user"></i> {{ player.name }} - Score : {{ player.score }}
          </li>
        </ul>
        <div class="col-12">
          Join Game :
          <input v-model="name" type="text" v-on:keypress.enter="addPlayer(false)">
        </div>
        <button v-on:click="addPlayer(false)" class="mr-2 mt-2">Join as Player</button>
        <button v-on:click="addPlayer(true)" v-if="!hasGM">Join as Game Master</button>
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
      </div>
    </div>
  </div>
</template>

<script>
// const IMAGE_DIMENSION_X = 1792;
// const IMAGE_DIMENSION_Y = 1536;

// const IMAGE_DIMENSION_RATIO = 0.7;

export default {
  name: 'Home',
  data() {
    return {
      // WebSocket
      ws: null,
      timerId: null,

      // Own info
      name: "",
      playerId: 0,

      // Room info
      players: [],
      answers: [],

      // HTML & status
      hasGM: false,

      // Gameplay
      alertMessage: "",
      newPlayer: "",
      submitting: false,
      showResults: false,
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
    const self = this;
    console.log("Starting Connection to WebSocket Server");
    this.ws = new WebSocket("wss://genshin-geoguesser-websocket.herokuapp.com/");
    // this.ws = new WebSocket("ws://localhost:3000");

    this.ws.onopen = function (event) {
      console.log("Successfully connected to WebSocket.", event);
      self.keepAlive();
    }

    this.ws.onmessage = function (event) {
      self.handleMessage(event);
    }

    this.ws.onclose = function () {
      console.log("Closed connection with WebSocket.");
    }
  },
  mounted() {
  },
  methods: {
    // WebSocket
    handleMessage(event) {
      const data = JSON.parse(event.data);
      console.log(data);
      switch (data.action) {
        case "STATUS_INIT":
          this.setupStatus(data.data);
          break;
        case "KEEP_ALIVE":
          break;
        case "HAS_GM":
          this.hasGM = true;
          break;
        case "UPDATE_PLAYERS":
          this.updatePlayers(data.data);
          break;
        case "UPDATE_PLAYER_ID":
          this.updatePlayers(data.data);
          this.playerId = data.data.find(pl => pl.name == this.name).id;
          break;
        default:
          console.log("Unkown Websocket action...", data);
      }
    },
    setupStatus(data) {
      this.hasGM = data.hasGM;
    },
    keepAlive() {
      if (this.ws.readyState == WebSocket.OPEN) {
        this.ws.send(JSON.stringify({action: "KEEP_ALIVE"}));
      }
      this.timerId = setTimeout(this.keepAlive, 60000);
    },
    addPlayer(isGM) {
      this.ws.send(JSON.stringify({
        action: "ADD_PLAYER",
        name: this.name,
        isGM: isGM
      }));
      this.hasGM = isGM;
      this.answers.push({
        x: null,
        y: null,
        score: 0
      });
      this.alertMessage = "";
    },
    updatePlayers(players) {
      this.players = players;
      // this.playerId = players.find(pl => pl.name == this.name).id;
      this.answers.push({
        x: null,
        y: null,
        score: 0
      });
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
        y: null,
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
    resetValues() {
      this.ws.send(JSON.stringify({ action: "RESET_VALUES" }));
    }
  },
  computed: {
  },
};
</script>

<style scoped>
</style>