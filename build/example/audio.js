import requestAnimationFunction from "//cdn.jsdelivr.net/npm/requestanimationfunction/requestAnimationFunction.js";
import AudioSeries from "./AudioSeries.js";
const update_chart = requestAnimationFunction(() => {
  chart.update();
});
const rms_series = new AudioSeries(500);
const rms_moving_series = new AudioSeries(30);
const clip_series = new AudioSeries(500);
const z_margin_series = new AudioSeries(500);
let z_margin = 2;
let process_count = 0;
window.process_audio = true;
const audio_context = new AudioContext();
const processor = audio_context.createScriptProcessor(2 ** 12);

processor.onaudioprocess = event => {
  if (!process_audio) return;
  const input_buffer = event.inputBuffer;

  for (let channel = 0; channel < input_buffer.numberOfChannels; ++channel) {
    const input_data = input_buffer.getChannelData(channel); // let sum = 0;

    let square_sum = 0;

    for (let sample = 0; sample < input_buffer.length; sample++) {
      // sum += input_data[sample];
      square_sum += input_data[sample] ** 2;
    } // const average = sum / input_buffer.length;
    // const deviation = Math.sqrt((square_sum - input_buffer.length * average ** 2) / (input_buffer.length - 1));


    const rms = Math.sqrt(square_sum);
    processRMS(rms);
  }
};

function processRMS(rms) {
  // console.log("rms: ", rms, average, deviation / average);
  rms_series.add(rms);
  z_margin_series.add(z_margin);
  const clip = rms_series.average + z_margin * rms_series.deviation < rms | 0;
  clip_series.add(clip);
  datasets[0].data = rms_series.map(toPoint);
  datasets[1].data = rms_series.__averageSeries.map(toPoint);
  datasets[2].data = rms_series.__averageSeries.map((value, i) => ({
    x: i,
    y: value + z_margin_series[i] * rms_series.__deviationSeries[i]
  }));
  datasets[3].data = rms_series.__averageSeries.map((value, i) => ({
    x: i,
    y: Math.max(value - z_margin_series[i] * rms_series.__deviationSeries[i], 0)
  }));
  datasets[4].data = clip_series.map(toPoint);
  update_chart();

  if (clip && !clip_series[clip_series.length - 2]) {
    console.log("create new node");
    graph.ensureVertex(process_count);

    for (let i = 1; i < rms_series.length; ++i) {
      if (graph.hasVertex(process_count - i)) {
        graph.addEdge(process_count, process_count - i);
      }
    }

    graphDisplay.graph = graph;
  }

  ++process_count;
}

function toPoint(value, i) {
  return {
    x: i,
    y: value
  };
}

navigator.getUserMedia({
  audio: true
}, stream => {
  const source = audio_context.createMediaStreamSource(stream);
  source.connect(processor);
  processor.connect(audio_context.destination);
}, error => {
  console.error(error);
});
const chart_element = document.querySelector("#audio-chart");
chart_element.setAttribute("height", parseFloat(chart_element.style.height));
const chart_context = chart_element.getContext("2d");
const datasets = [{
  label: "RMS",
  yAxisID: "volume",
  data: [],
  lineTension: 0,
  pointRadius: 0,
  showLine: true,
  fill: false,
  spanGaps: true,
  borderWidth: 1,
  borderColor: "#00897b"
}, {
  label: "Average RMS",
  yAxisID: "volume",
  data: [],
  lineTension: 0,
  pointRadius: 0,
  showLine: true,
  fill: false,
  spanGaps: true,
  borderWidth: 1,
  borderColor: "purple"
}, {
  label: "Upper Margin",
  yAxisID: "volume",
  data: [],
  lineTension: 0,
  pointRadius: 0,
  showLine: true,
  fill: false,
  spanGaps: true,
  borderWidth: 1,
  borderColor: "#f44336"
}, {
  label: "Lower Margin",
  yAxisID: "volume",
  data: [],
  lineTension: 0,
  pointRadius: 0,
  showLine: true,
  fill: false,
  spanGaps: true,
  borderWidth: 1,
  borderColor: "#f44336"
}, {
  label: "Clip",
  yAxisID: "unity",
  data: [],
  lineTension: 0,
  pointRadius: 0,
  showLine: true,
  fill: true,
  spanGaps: true,
  borderWidth: 0,
  backgroundColor: "#ffcdd2"
}];
window.chart = Chart.Scatter(chart_context, {
  type: "scatter",
  data: {
    datasets
  },
  options: {
    scales: {
      yAxes: [{
        id: "volume",
        type: "linear",
        position: "left",
        ticks: {
          beginAtZero: true
        }
      }, {
        id: "unity",
        type: "linear",
        position: "right",
        ticks: {
          max: 1,
          min: 0
        }
      }]
    },
    animation: {
      duration: 0
    }
  }
});