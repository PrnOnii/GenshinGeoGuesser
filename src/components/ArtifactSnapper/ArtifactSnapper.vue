<template>
  <div class="container-fluid">
    <div class="container">
      <h1 class="mt-5 justify-left">Artifact snapper</h1>
      <div class="row">
        <div class="col">
          <input type="file" @change="uploadFiles" multiple>
          <button v-if="images.length == 5" @click="pasteImages" class="btn btn-success ml-5">Show Result</button>
        </div>
      </div>
    </div>
    <div class="row mt-5" v-show="fileProccessed == 5 && !imageFused">
      <div class="container">
        <div class="alert alert-info" role="alert">
          Reorder the images in the right order : Flower of Life, Plume of Death, Sands of Eon, Goblet of Eonothem and Circlet of Logos
        </div>
      </div>
      <div class="container-fluid text-center">
        <draggable v-model="images">
          <img v-for="image in images" :key="image.id" :src="imageData(image.canvas)" width="300px" class="mr-1 ml-1">
        </draggable>
      </div>
    </div>
    <div class="row mt-5" v-show="imageFused">
      <div class="col">
        <img id="resultIMG" width="100%">
      </div>
    </div>
  </div>
</template>

<script>
const XRATIO = 1293 / 1920;
const YRATIO = 119 / 1080;
const WIDTHRATIO = 492 / 1920;
const HEIGHTRATIO = 842 / 1080;

import draggable from 'vuedraggable';

export default {
  components: {
    draggable,
  },
  name: 'Home',
  data() {
    return {
      images: [],
      imageFused: false,
      width: 0,
      height: 0,
    }
  },
  computed: {
    fileProccessed: function () {
      return this.images.length;
    },
  },
  methods: {
    uploadFiles(event) {
      let self = this;
      event.target.files.forEach((element, i) => {
        let self2 = self;
        let reader = new FileReader();
        reader.readAsDataURL(element);
        reader.onload = function (e) {
          self2.cropImage({
            id: i,
            name: element.name,
            image: e.target.result
          })
        };

      });
    },
    cropImage(file) {
      let self = this;
      var canvas = document.createElement("canvas");
      var context = canvas.getContext('2d');
      var imageObj = new Image();
      imageObj.src = file.image;


      imageObj.onload = function () {
        let x = this.width * XRATIO;
        let y = this.height * YRATIO;
        let width = this.width * WIDTHRATIO;
        let height = this.height * HEIGHTRATIO;
        self.width = width;
        self.height = height;
        canvas.width = width;
        canvas.height = height;

        context.drawImage(imageObj, x, y, width, height, 0, 0, width, height);
        self.images.push({
          id: file.id,
          name: file.name,
          canvas: context.canvas
        });
        if (self.fileProccessed === 5) {
          self.initGrid();
        }
      };
    },
    initGrid() {
      this.images.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
    },
    pasteImages() {
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');

      canvas.width = 5 * this.width;
      canvas.height = this.height;

      for (let i = 0; i < this.images.length; i++) {
        context.drawImage(this.images[i].canvas, this.width * i, 0);
      }
      this.imageFused = true;
      document.getElementById('resultIMG').src = canvas.toDataURL("image/png");
    },
    imageData(canvas) {
      return canvas.toDataURL("image/png");
    }
  },
};
</script>

<style scoped>
</style>