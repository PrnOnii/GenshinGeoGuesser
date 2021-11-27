<template>
  <div class="container-fluid">
    <div class="mt-3 alert alert-danger" role="alert" v-if="alertMessage">
      {{ alertMessage }}
    </div>
    <h1 class="mt-3">Welcome to Genshin Impact GeoGuesser</h1>
    <button v-on:click="resetValues()">Reset</button>
    <div class="row">
      <!-- Players -->
      <div class="col-3 text-left">
        <h3>Players : </h3>
        <div v-if="gameMaster">
          <h4>Current GameMaster : {{ this.gameMaster.name }}</h4>
        </div>
        <ul v-if="players.length > 0">
          <li v-for="(player, index) in players" :key="player+'-'+index" :style="'color: '+colors[index]">
            <i class="fas fa-user"></i> {{ player.name }} - Score : {{ player.score }}
            <span v-if="player.answered">(has answered)</span>
            <span v-on:click="removePlayer(player.id)" v-if="isGM">X</span>
          </li>
        </ul>

        <!-- Join Game -->
        <div v-if="!hasJoinedRoom">
          <div class="col-12">
            Enter your name :
            <input v-model="name" type="text" v-on:keypress.enter="addPlayer(false)">
          </div>
          <button v-on:click="addPlayer(false)" class="mr-2 mt-2" v-if="name">Join as Player</button>
          <button v-on:click="addPlayer(true)" v-if="name && !gameMaster">Join as Game Master</button>
        </div>
      </div>

      <!-- Gameplay -->
      <div class="col-9">
        <!-- Waiting Room -->
        <div v-if="!gameStarted && hasJoinedRoom">
          <!-- GM side -->
          <div v-if="isGM">
            <button v-on:click="startGame" class="btn btn-primary">
              Start new Game
            </button>
          </div>
          <!-- Player Side -->
          <div v-if="!isGM">
            Waiting for Game Master to start the game...
          </div>
        </div>

        <div v-if="gameStarted">
          <!-- Players gameplay -->
          <div v-if="!isGM">

          <div v-if="roundStarted">
            <h3>Click the image where you think the character is.</h3>
            <div v-on:click="submitAnswer($event)" style="width: 1792px; height: 1536px; background-image: url('https://i.imgur.com/TdI4Bm1.png');"></div>
          </div>
          <div v-if="resultPage">
            List of answers
            <div v-for="(player, index) in players" :key="player+'-'+index+'result'">
              <i class="fas fa-user"></i> {{ player.name }} - Answers : {{ answers[index].x }}, {{ answers[index].y }}, distance : {{ answers[index].distance }}, 
               => Score : {{ answers[index].score }}.
            </div>
          </div>

          </div>
          <!-- GM answers -->
          <div v-if="isGM">
            <div v-if="roundStarted">
              <div class="row">
                <h3>Good answer :</h3>
                <div class="col-5">
                  <div class="input-group">
                    <span class="input-group-text">X</span>
                    <input type="number" class="form-control" v-model="goodAnswer.x">
                  </div>
                </div>
                <div class="col-5">
                  <div class="input-group">
                    <span class="input-group-text">Y</span>
                    <input type="number" class="form-control" v-model="goodAnswer.y">
                  </div>
                </div>
              </div>
              <div class="row">
                <button 
                  type="submit"
                  class="btn btn-success mt-5"
                  v-on:click="endRound"
                  v-if="!resultPage"
                >
                  Sumbit answer and end round
                </button>
              </div>
            </div>

            <div v-if="resultPage">
            List of answers
            <div v-for="(player, index) in players" :key="player+'-'+index+'result'">
              <i class="fas fa-user"></i> {{ player.name }} - Answers : {{ answers[index].x }}, {{ answers[index].y }}, distance : {{ answers[index].distance }}, 
               => Score : {{ answers[index].score }}.
            </div>

            <button v-on:click="newRound">New Round</button>
            <button v-on:click="endGame">End Game</button>
          </div>
          </div>
        </div>
      </div>




      <!-- OLD Gameplay -->
      <!-- <div class="col">
        <h3>A CHANGER</h3>
        <button v-if="!roundStarted" v-on:click="startGame" class="btn btn-primary">
          Submit new results
        </button>
        <div v-if="roundStarted">
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
              <div v-if="resultPage" class="col">
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
              v-if="!resultPage"
            >
              Sumbit Results
            </button>
            <button
              class="btn btn-primary mt-5"
              v-if="roundStarted&&resultPage"
              v-on:click="newRound"
            >
              New round
            </button>
          </div>
        </div>
      </div> -->
    </div>
    <div class="row" v-show="resultPage">
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
      hasJoinedRoom: false,
      name: null,
      playerData: null,
      isGM: false,

      // Room info
      gameMaster: null,
      players: [],
      answers: [],

      // HTML & status
      gameStarted: false,
      roundStarted: false,
      resultPage: false,

      // Gameplay
      goodAnswer: {x: 0, y: 0},
      alertMessage: "",
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
      const response = JSON.parse(event.data);
      console.log(response);
      switch (response.action) {
        case "STATUS_INIT":
          this.setupEnvironment(response.data.environment);
          this.gameMaster = response.data.gameMaster;
          this.updatePlayers(response.data.players);
          break;
        case "KEEP_ALIVE":
          break;
        case "HAS_GM":
          this.gameMaster = response.gameMaster;
          break;
        case "UPDATE_PLAYERS":
          this.updatePlayers(response.players);
          break;
        case "ROUND_STARTED":
          this.startRound();
          break;
        case "SHOW_RESULTS":
          this.showResults(response.players, response.answers);
          break;
        case "GAME_ENDED":
          this.resetValues();
          break;
        default:
          console.log("Unkown Websocket action...", response);
      }
    },
    setupEnvironment(environment) {
      this.GMId = environment.GMId;
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
      this.hasJoinedRoom = true;
      this.isGM = isGM;
      this.hasGM = isGM;
    },
    updatePlayers(players) {
      this.players = players;
      if (this.name) {
        this.playerData = players.find(pl => pl.name == this.name);
      }
    },
    removePlayer(id) {
      this.ws.send(JSON.stringify({
        action: "REMOVE_PLAYER", playerId: id
      }));
    },
    startGame() {
      this.ws.send(JSON.stringify({
        action: "START_GAME"
      }));
    },
    startRound() {
      this.gameStarted = true;
      this.roundStarted = true;
    },
    submitAnswer(e) {
      console.log(e);
      var rect = e.target.getBoundingClientRect();
      var x = Math.round(e.clientX - rect.left);
      var y = Math.round(e.clientY - rect.top);
      console.log("Sending X Y", x, y);
      console.log(this.playerData);
      this.ws.send(JSON.stringify({
        action: "SUBMIT_ANSWER",
        player: this.playerData,
        answer: { x: x, y: y },
      }));
    },
    endRound() {
      console.log("Sending good Answer", this.goodAnswer);
      this.ws.send(JSON.stringify({
        action: "END_ROUND",
        goodAnswer: this.goodAnswer
      }));
    },
    showResults(players, answers) {
      this.roundStarted = false;
      this.resultPage = true;
      this.players = players;
      this.answers = answers;
    },
    newRound() {
      this.answers = [];
      this.goodAnswer = {};
      for (let index = 0; index < this.players.length; index++) {
        this.answers.push({
        x: null,
        y: null,
        score: 0
      });
      }
      this.resultPage = false;
      this.roundStarted = true;
      this.ws.send(JSON.stringify({
        action: "NEW_ROUND"
      }));
    },
    endGame() {
      this.ws.send(JSON.stringify({
        action: "END_GAME"
      }));
      this.resetValues();
    },
    resetValues() {
      this.ws.send(JSON.stringify({ action: "RESET_VALUES" }));
      this.players = [];
      this.hasJoinedRoom = false;
      this.name = null;
      this.playerData = null;
      this.isGM = false;
      this.gameMaster = null;
      this.players = [];
      this.answers = [];
      this.gameStarted = false;
      this.roundStarted = false;
      this.resultPage = false;
      this.goodAnswer = {x: null, y: null};
    }
  }
};
</script>

<style scoped>
</style>