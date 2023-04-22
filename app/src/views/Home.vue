<template>
  <b-row id="Home">
    <b-col id="setup" cols="12" md="4" class="mb-4">
      <b-input-group prepend="Nr.:" class="m-2">
        <b-input type="number" v-model="numberOfFigures" />
        <b-input-group-append v-if="!running">
          <b-button @click="restart" v-if="this.figures.length > 0">
            <b-icon-skip-start-fill />
            Restart
          </b-button>
          <b-button v-if="!stopped" @click="go" variant="success">
            Go
            <b-icon-play-fill />
          </b-button>
          <!-- <b-button @click="test" variant="success">
            test
            <b-icon-play />
          </b-button> -->
        </b-input-group-append>
        <b-input-group-append v-else>
          <b-button @click="stop" variant="danger">
            Stop
            <b-icon-pause-fill />
          </b-button>
        </b-input-group-append>
      </b-input-group>

      <div>
        <b-progress class="m-2" :max="numberOfFigures">
          <b-progress-bar id="rock-progress" :value="rockNumber"
            >Rock: {{ rockNumber }}</b-progress-bar
          >
          <b-progress-bar id="paper-progress" :value="paperNumber"
            >Paper: {{ paperNumber }}</b-progress-bar
          >
          <b-progress-bar id="scissor-progress" :value="scissorNumber"
            >Scissors: {{ scissorNumber }}</b-progress-bar
          >
        </b-progress>
      </div>
      <LineChart
        id="progression-chart"
        :options="chartOptions"
        :data="chartData"
      />

      <details>
        <summary>Advanced settings</summary>
        <b-input-group
          prepend="Border force"
          class="m-2"
          v-b-tooltip.hover
          title="Adds a force to figures at the border of the field."
        >
          <b-input v-model="borderpush" type="number" step=".05" min="0" />
        </b-input-group>
        <b-input-group
          prepend="Border margin"
          append="relative to field size"
          class="m-2"
          v-b-tooltip.hover
          title="Proportion of the field, where pieces experience the border force."
        >
          <b-input
            v-model="bordermargin"
            type="number"
            step=".1"
            min="0"
            max=".5"
          />
        </b-input-group>
        <b-input-group
          prepend="Collision distance"
          append="relative to field size"
          class="m-2"
          v-b-tooltip.hover
          title="Distance where a collision is detected."
        >
          <b-input
            v-model="collision"
            type="number"
            step=".02"
            min="0"
            max=".5"
          />
        </b-input-group>
        <b-input-group
          prepend="Fleeing handicap"
          class="m-2"
          title="Handicap for the 'fleeing from other figures'. Low values make more interesting games."
        >
          <b-input
            v-model="chaseeHandicap"
            type="number"
            step=".1"
            min="0"
            max="1"
            v-b-tooltip.hover
          />
        </b-input-group>
        <b-input-group
          prepend="Distance Exponent"
          class="m-2"
          v-b-tooltip.hover
          title="Exponent for the distance factor in the movement vector. Large values make close figures more important."
        >
          <b-input v-model="distanceExponent" type="number" step=".1" min="0" />
        </b-input-group>
        <b-input-group
          prepend="Movement noise"
          class="m-2"
          v-b-tooltip.hover
          title="Noise to add to the movement. Prevents stuck games."
        >
          <b-input v-model="noise" type="number" step=".1" min="0" />
        </b-input-group>
        <b-input-group
          class="m-2"
          v-b-tooltip.hover
          title="Limits the view of each figure to the closest <numberOFigures> / <viewSlice> figures. Slow down early game and prevents slow finishes"
        >
          <b-input-group-prepend is-text>
            <b-form-checkbox v-model="limitedView">
              View slice
            </b-form-checkbox>
          </b-input-group-prepend>
          <b-form-input
            v-model="viewSlice"
            type="number"
            step="1"
            min="1"
            :max="numberOfFigures"
          />
        </b-input-group>
      </details>
    </b-col>

    <b-col md="1" class="d-none d-md-block" />

    <b-col cols="12" md="7" id="canvas-wrapper" class="mb-4">
      <div id="canvas">
        <div
          v-for="(figure, index) in figures"
          :key="index"
          class="figure"
          :id="'figure' + index"
          :style="getFigureStyle(figure)"
        >
          <b-icon-scissors v-if="figure.type == 's'" />
          <b-icon-journal-text v-if="figure.type == 'p'" />
          <b-icon-circle v-if="figure.type == 'r'" />
        </div>
      </div>
    </b-col>
  </b-row>
</template>

<script>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line as LineChart } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default {
  name: "HomeView",
  components: { LineChart },
  data() {
    return {
      running: false,
      stopped: false,
      numberOfFigures: 50,
      figures: [],
      fieldsize: 100,
      fieldzoom: 5,
      borderpush: 0.1,
      bordermargin: 0.1,
      collision: 0.06,
      chaseeHandicap: 0.2,
      distanceExponent: 1.5,
      noise: 0.1,
      limitedView: true,
      viewSlice: 2,
      gameticker: null,
      chartOptions: {
        responsive: true,
      },
      scissorData: [],
      paperData: [],
      rockData: [],
      tickCounter: 0,
    };
  },
  methods: {
    test() {
      console.log(
        this.singleMoveVector(
          { x: 0, y: 1, type: "s" },
          { x: 0, y: 0, type: "s" }
        ),
        this.singleMoveVector(
          { x: 0, y: 0, type: "s" },
          { x: 0, y: 1, type: "s" }
        )
      );
    },
    initFigures() {
      this.figures = [...Array(Number(this.numberOfFigures))].map(() => {
        return {
          x: Math.random() * this.fieldsize,
          y: Math.random() * this.fieldsize,
          type: ["s", "r", "p"][Math.round(Math.random() * 2)],
        };
      });
      this.rockData = [];
      this.scissorData = [];
      this.paperData = [];
    },
    go() {
      if (this.figures.length == 0) this.initFigures();
      this.running = true;
      this.stopped = false;
      this.gameticker = setInterval(this.tick, 100);
    },
    stop() {
      this.running = false;
      clearInterval(this.gameticker);
    },
    restart() {
      this.figures = [];
      this.go();
    },
    getFigureStyle(figure) {
      return {
        bottom: figure.y + "%",
        left: figure.x + "%",
      };
    },
    tick() {
      this.transformations();
      this.moveFigures();
      this.tickCounter++;
      if (this.tickCounter % 10 == 0) {
        this.paperData.push(this.paperNumber);
        this.rockData.push(this.rockNumber);
        this.scissorData.push(this.scissorNumber);
      }
      if (
        this.rockNumber == this.numberOfFigures ||
        this.paperNumber == this.numberOfFigures ||
        this.scissorNumber == this.numberOfFigures
      ) {
        this.stopped = true;
        this.stop();
      }
    },
    transformations() {
      for (const fig of this.figures) {
        const figures_copy = JSON.parse(JSON.stringify(this.figures)).filter(
          (fig_copy) => {
            return !(fig_copy.x == fig.x && fig_copy.y == fig.y);
          }
        );
        figures_copy.forEach((fig_copy) => {
          fig_copy.dist = this.distance(fig_copy, fig);
          if (isNaN(fig_copy.dist)) console.warn("dist is NaN", fig_copy, fig);
        });
        const closest_fig = figures_copy.sort((a, b) => a.dist - b.dist)[0];
        if (!closest_fig) continue;
        if (closest_fig.dist > this.fieldsize * this.collision) continue;
        if (fig.type == closest_fig.type) continue;
        let transformation_happening = false;
        switch (fig.type) {
          case "r":
            transformation_happening = closest_fig.type == "p";
            break;
          case "s":
            transformation_happening = closest_fig.type == "r";
            break;
          case "p":
            transformation_happening = closest_fig.type == "s";
            break;
        }
        if (transformation_happening) {
          // console.log(
          //   `Transforming fig @(${fig.x}, ${fig.y}) into ${closest_fig.type}`
          // );
          fig.type = closest_fig.type;
        }
      }
    },
    moveFigures() {
      this.figures.forEach((fig) => {
        let figures_copy = JSON.parse(JSON.stringify(this.figures)).filter(
          (fig_copy) => {
            return !(fig_copy.x == fig.x && fig_copy.y == fig.y);
          }
        );

        if (this.limitedView)
          figures_copy = figures_copy
            .sort((a, b) => this.distance(fig, a) - this.distance(fig, b))
            .slice(0, this.numberOfFigures / this.viewSlice);

        // let fig = this.figures[0];
        let moveSum = { x: 0, y: 0 };
        for (const fig_copy of figures_copy) {
          const moveVector = this.singleMoveVector(fig, fig_copy);
          const dist = this.distance(fig, fig_copy);
          if (dist > 0 && dist < this.fieldsize * 1) {
            // console.log({ moveVector });
            moveSum.x += moveVector.x / dist ** this.distanceExponent;
            moveSum.y += moveVector.y / dist ** this.distanceExponent;
          }
        }
        let newX = fig.x + moveSum.x;
        let newY = fig.y + moveSum.y;
        if (newX < this.fieldsize * this.bordermargin)
          newX += this.borderpush / (newX > 1 ? newX : 1);
        if (newX > this.fieldsize * (1 - this.bordermargin || 1))
          newX -= this.borderpush / (this.fieldsize - newX || 0.001);
        if (newY < this.fieldsize * this.bordermargin)
          newY += this.borderpush / (newY > 1 ? newY : 1);
        if (newY > this.fieldsize * (1 - this.bordermargin))
          newY -= this.borderpush / (this.fieldsize - newY || 0.001);

        newX += (Math.random() - 0.5) * this.noise;
        newY += (Math.random() - 0.5) * this.noise;

        fig.x = Math.max(Math.min(this.fieldsize, newX), 0);
        fig.y = Math.max(Math.min(this.fieldsize, newY), 0);
      });
    },
    singleMoveVector(figA, figB) {
      if (figA.type == figB.type) {
        // console.log(figA.type, figB.type);
        // console.log(figA.x, figB.x, figA.x - figB.x, Math.abs(figA.x - figB.x));
        const distX =
          Math.round(Math.abs(figA.x - figB.x)) ** -this.distanceExponent;
        const distY =
          Math.round(Math.abs(figA.y - figB.y)) ** -this.distanceExponent;
        if (distX + distY > this.fieldsize * 1.6) return { x: 0, y: 0 };
        // console.log("similar type.", distX, distY);
        return {
          x: figA.x >= figB.x ? distX : -distX,
          y: figA.y >= figB.y ? distY : -distY,
        };
        // return { x: 0, y: 0 };
      }

      let attraction = false;

      switch (figA.type) {
        case "r":
          attraction = figB.type == "s";
          break;
        case "s":
          attraction = figB.type == "p";
          break;
        case "p":
          attraction = figB.type == "r";
          break;
      }
      // console.log({ attraction });

      if (!attraction)
        return {
          x: (figA.x - figB.x) * (1 - this.chaseeHandicap),
          y: (figA.y - figB.y) * 1 - this.chaseeHandicap,
        };
      else return { x: figB.x - figA.x, y: figB.y - figA.y };
      // else return { x: 0, y: 0 };
    },
    distance(figA, figB) {
      const x_dist = figA.x - figB.x;
      const y_dist = figA.y - figB.y;
      const dist = Math.sqrt(Math.round(x_dist) ** 2 + Math.round(y_dist) ** 2);
      return dist;
    },
  },
  computed: {
    rockNumber() {
      return this.figures.filter((i) => i.type == "r").length;
    },
    paperNumber() {
      return this.figures.filter((i) => i.type == "p").length;
    },
    scissorNumber() {
      return this.figures.filter((i) => i.type == "s").length;
    },
    chartData() {
      return {
        labels: [...Array(this.rockData.length)].map((item, i) => i),
        datasets: [
          {
            label: "Rock",
            backgroundColor: "#B890E0",
            data: this.rockData,
          },
          {
            label: "Paper",
            backgroundColor: "#FF8785",
            data: this.paperData,
          },
          {
            label: "Scissor",
            backgroundColor: "#297373",
            data: this.scissorData,
          },
        ],
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat&display=swap");
#Home {
  font-family: "Montserrat", sans-serif;
  width: 100vw;
  padding: 0 5vw;
  min-height: 80vh;
  padding-bottom: 20px;
}

#setup {
  padding: 20px 30px 20px 20px;
  background-color: var(--background-color);
  border: 1px solid var(--shadow-color);
  border-radius: 18px;
  box-shadow: var(--shadow-color) 20px 20px;
  // height: max-content;
  max-height: 80vh;
}

#canvas-wrapper {
  padding: 0;
  border: 1px solid var(--shadow-color);
  border-radius: 18px;
  box-shadow: var(--shadow-color) 20px 20px;
  max-height: 80vh;
  min-height: 40vh;
}

#canvas {
  margin-right: 18px;
  margin-top: 24px;
  position: relative;
  width: calc(100% - 18px);
  height: calc(100% - 24px);
}

.figure {
  position: absolute;
}

#scissor-progress {
  background-color: #297373;
}
#rock-progress {
  background-color: #b890e0;
}
#paper-progress {
  background-color: #ff8785;
}
</style>
