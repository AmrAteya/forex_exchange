<template>
  <v-app>
    <v-main class="pt-5">
      <v-card class="d-flex align-center justify-center" elevation="0">
        <v-row>
          <v-col
            cols="12"
            lg="4"
            md="6"
            sm="12"
            xs="12"
            class="d-flex align-center justify-end"
          >
          <!-- Currency selectors start -->
            <v-row class="d-flex align-center justify-end">
              <v-col
                cols="12"
                lg="12"
                md="12"
                sm="12"
                xs="12"
                class="d-flex align-center justify-center"
              >
                <v-select
                  :loading="selectorLoading"
                  outlined
                  :items="currencies"
                  item-text="text"
                  item-value="value"
                  v-model="currency.from"
                  hide-details
                  label="From"
                  class="mx-5"
                />
              </v-col>
              <v-col
                cols="12"
                lg="12"
                md="12"
                sm="12"
                xs="12"
                class="d-flex align-center justify-center"
              >
                <v-select
                  :loading="selectorLoading"
                  outlined
                  :items="currencies"
                  item-text="text"
                  item-value="value"
                  v-model="currency.to"
                  hide-details
                  label="To"
                  class="mx-5"
                />
              </v-col>
            </v-row>
            <!-- Currency selectors end -->
          </v-col>
          <!-- Chart start -->
          <v-col cols="12" lg="8" md="6" sm="12" xs="12">
            <v-card :loading="chartLoading" elevation="5" class="px-5 ma-5">
              <div
                :class="`currency-flag currency-flag-${currency.from.toLowerCase()} mr-2 mt-5`"
              ></div>
              <div
                :class="`currency-flag currency-flag-${currency.to.toLowerCase()} mt-5`"
              ></div>
              <v-chip @click="goToForexSite" class="mb-8 ml-2"
                >Forex.com</v-chip
              >
              <div
                class="
                  d-flex
                  justify-space-between
                  content-center
                  bg
                  fill-height
                  align-center
                  justify-center
                "
              >
                <div class="text-center font-weight-bold" :class="{'text-h5':$vuetify.breakpoint.smAndDown, 'text-h4':$vuetify.breakpoint.mdAndUp}">
                  {{ currency.from + "/" + currency.to }}
                </div>
                <div v-if="seriesArea[0].data.length">
                  <div class="text-center font-weight-bold" :class="{'text-h5':$vuetify.breakpoint.smAndDown, 'text-h4':$vuetify.breakpoint.mdAndUp}">
                    {{getCurrencySymbol('en-US', currency.to)}}
                    {{ currentPrice }}
                  </div>
                  <div class="mt-2 text-subtitle-1 text info--text">
                    {{ startingVSEndingPrice }}
                  </div>
                </div>
              </div>
              <ApexChart
                class="mx-2 chart d-flex align-center justify-center"
                width="90%"
                type="area"
                :options="chartOptions"
                :series="seriesArea"
                :sparkline="{
                  enabled: true,
                }"
              />
              <div class="d-flex align-center justify-center pb-5">
                <v-btn-toggle group dense v-model="period" color="primary">
                  <v-btn text value="15M" class="mr-2"> 15M </v-btn>
                  <v-btn text value="1H" class="mr-2"> 1H </v-btn>
                  <v-btn text value="1D" class="mr-2"> 1D </v-btn>
                  <v-btn text value="1W" class="mr-2"> 1W </v-btn>
                  <v-btn class="mr-2" text value="1M"> 1M </v-btn>
                </v-btn-toggle>
              </div>
            </v-card>
          </v-col>
          <!-- Chart end -->
        </v-row>
      </v-card>
      <!-- Bottom sheet start (For live pricing) -->
      <v-bottom-navigation
        app
        class="
          d-flex
          justify-space-around
          content-center
          bg
          fill-height
          align-center
          justify-center
        "
      >
        <v-progress-circular
          v-if="!message.symbol"
          size="30"
          color="primary"
          indeterminate
        ></v-progress-circular>
        <div v-else>
          <div class="text-h6">
            <v-icon small class="mb-1" color="red">mdi-circle</v-icon>
            {{ message.symbol.slice(0, 3) + "/" + message.symbol.slice(3) }}
          </div>
          <span>
            Ask: {{ message["ask"] }} | mid: {{ message.mid }} | Bid:
            {{ message.bid }}
          </span>
        </div>
      </v-bottom-navigation>
      <!-- Bottom navigation end (For live pricing) -->
    </v-main>
  </v-app>
</template>

<script>
import Axios from "axios";
var moment = require("moment");
export default {
  name: "App",
  data() {
    return {
      chartLoading: false,
      period: "",
      periods: {
        "15M": { time: 15, unit: "minutes", interval: "minute" },
        "1H": { time: 1, unit: "hours", interval: "minute" },
        "1D": { time: 1, unit: "days", interval: "hourly" },
        "1W": { time: 1, unit: "weeks", interval: "hourly" },
        "1M": { time: 1, unit: "months", interval: "daily" },
      },
      selectorLoading: false,
      currencies: [],
      currency: {
        from: "EUR",
        to: "USD",
      },
      seriesArea: [
        {
          name: "Exchange",
          data: [],
        },
      ],
      times: [],
      message: {
        symbol: "",
        ask: "",
        bid: "",
        mid: "",
      },
      startingVSEndingPrice: "",
      currentPrice: "",
    };
  },
  watch: {
    // This watcher is for handling on change period from under the chart
    period(val) {
      this.getCurrencyExchangeTimeseries(this.periods[val]);
    },
    // This watcher is for performing actions when changing the currency from selectors
    'currency.to': {
      handler(newVal, oldVal) {
        if (newVal == this.currency.from) {
          this.currency.from = oldVal
          return
        }
        this.period = ''
        this.getCurrencyExchangeTimeseries(undefined, this.currency.from + this.currency.to)
      },
      deep: true
    },
    'currency.from': {
     handler(newVal, oldVal) {
        if (newVal == this.currency.to) {
          this.currency.to = oldVal
          return
        }
        this.period = ''
        this.getCurrencyExchangeTimeseries(undefined, this.currency.from + this.currency.to)
      },
      deep: true
    },
  },
  computed: {
    // Chaart options
    chartOptions() {
      return {
        xaxis: {
          categories: this.times,
          labels: {
            show: false,
          },
        },
        stroke: {
          width: 1,
          curve: "straight",
          lineCap: "round",
        },
        dataLabels: {
          enabled: false,
        },
        markers: {
          show: true,
          size: 0,
        },
        yaxis: {
          labels: {
            show: false,
          },
        },
        tooltip: {
          enabled: true,
          onDatasetHover: {
            highlightDataSeries: true,
          },
          x: {
            formatter: undefined,
          },
          y: {
            formatter: undefined,
          },
        },
      };
    }
  },
  methods: {
    // Get currencies
    getCurrencies() {
      this.selectorLoading = true;
      Axios.get(
        "https://marketdata.tradermade.com/api/v1/live_currencies_list?api_key=eOfPku3ezlOjlMitRDuU"
      )
        .then((response) => {
          for (const currencyCode in response.data.available_currencies) {
            this.currencies.push({
              value: currencyCode,
              text: response.data.available_currencies[currencyCode],
            });
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.selectorLoading = false;
        });
    },
    /*
        Get currency exchange timeseries
        start: Object {time: integetr, unit: string [months, weeks, days, hours, minutes...]}
        interval: string [daily, hourly, minute]
      */
    getCurrencyExchangeTimeseries(
      start = { time: 12, unit: "months", interval: "daily" },
      currencies = this.currency.from + this.currency.to
    ) {
      this.chartLoading = true;
      let now = new Date();
      let nowTime = moment(now).subtract(3, "hours");
      let timeNow = nowTime.format("YYYY-MM-DD-HH:MM");
      let startTime = nowTime
        .subtract(start.time, start.unit)
        .format("YYYY-MM-DD-HH:MM");
      let interval = start.interval;
      Axios.get(
        `https://marketdata.tradermade.com/api/v1/timeseries?currency=${currencies}&api_key=eOfPku3ezlOjlMitRDuU&start_date=${startTime}&end_date=${timeNow}&format=records&interval=${interval}`
      )
        .then((response) => {
          this.seriesArea[0].data = [];
          this.times = [];
          response.data.quotes.forEach((el) => {
            this.seriesArea[0].data.push(el.close);
            this.times.push(el.date);
          });
          this.currentPrice =
            response.data.quotes[response.data.quotes.length - 1].close;
          this.startingVSEndingPrice = `${(
            this.currentPrice - response.data.quotes[0].close
          ).toFixed(6)}  (${(
            this.currentPrice / response.data.quotes[0].close
          ).toFixed(6)} %)`;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.chartLoading = false;
        });
    },
    // Open forex site in new tab
    goToForexSite() {
      window.open("https://forex.com", "_blank");
    },
    // Connect to websocket to get live pricing of selected currency pair
    connectToWebSocket() {
      var reconnectInterval = 1000 * 5;
      let exchange = this.currency.from + this.currency.to;
      const connection = new WebSocket(
        "wss://marketdata.tradermade.com/feedadv"
      );
      connection.onopen = function () {
        connection.send(
          `{"userKey":"wsTOJUe98dFrf3pQx_HQ", "symbol":"${exchange}"}`
        );
      };
      connection.onclose = () => {
        console.log("socket close : will reconnect in " + reconnectInterval);
        setTimeout(() => {
          this.connectToWebSocket()
        }, reconnectInterval);
      };
      connection.onmessage = (event) => {
        setTimeout(() => {
          if(event.data.includes('{')) {
            this.message = JSON.parse(event.data);
          }
        }, 5000);
      };
    },
    // Get currency symbol using javascript
    getCurrencySymbol(locale, currency) {
      return (0)
        .toLocaleString(locale, {
          style: "currency",
          currency: currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
        .replace(/\d/g, "")
        .trim();
    },
  },
  created() {
    this.connectToWebSocket();
    this.getCurrencies();
    this.getCurrencyExchangeTimeseries()
  },
};
</script>

<style scoped>
@import "./assets/main.css";
.chart {
  max-height: 500px !important;
}
.v-btn {
  border-radius: 20% !important;
  width: 5vw !important;
}
.v-app {
  height: 90vh !important;
}
</style>
