<template>
  <v-app>
    <v-main class="d-flex align-center justify-center">
      <v-card elevation="2">
        <v-row>
          <v-col
            cols="12"
            lg="4"
            md="6"
            sm="12"
            xs="12"
            class="d-flex align-center justify-end"
          >
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
          </v-col>
          <v-col cols="12" lg="8" md="6" sm="12" xs="12">
            <v-card :loading="chartLoading" elevation="5" class="px-5 ma-5">
              <div
                :class="`currency-flag currency-flag-${currency.from.toLowerCase()} mr-2 mt-5`"
              ></div>
              <div
                :class="`currency-flag currency-flag-${currency.to.toLowerCase()} mt-5`"
              ></div>
              <v-chip color="primary" @click="goToForexSite" class="mb-8 ml-2"
                >Forex.com</v-chip
              >
              <ApexChart
                class="mx-2 chart d-flex align-center justify-center"
                width="90%"
                type="area"
                :options="optionsArea"
                :series="seriesArea"
                :sparkline="{
                  enabled: false,
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
        </v-row>
      </v-card>
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
        "15M": { time: 15, unit: "minutes" },
        "1H": { time: 1, unit: "hours" },
        "1D": { time: 1, unit: "days" },
        "1W": { time: 1, unit: "weeks" },
        "1M": { time: 1, unit: "months" },
      },
      currenciesObj: {
    "AED": "UAE Dirham", 
    "ALL": "Albanian Lek", 
    "ARS": "Argentine Peso", 
    "AUD": "Australian Dollar", 
    "BGN": "Bulgaria Lev", 
    "BHD": "Bahraini Dinar", 
    "BRL": "Brazilian Real", 
    "CAD": "Canadian Dollar", 
    "CHF": "Swiss Franc", 
    "CLP": "Chilean Peso", 
    "CNH": "Chinese Yuan offshore", 
    "CNY": "Chinese Yuan onshore", 
    "COP": "Colombian Peso", 
    "CZK": "Czech Koruna", 
    "DKK": "Danish Krone", 
    "EUR": "Euro", 
    "GBP": "British Pound Sterling", 
    "GHS": "Ghanaian Cedi", 
    "HKD": "Hong Kong Dollar", 
    "HRK": "Croatian Kuna", 
    "HUF": "Hungarian Forint", 
    "IDR": "Indonesian Rupiah", 
    "ILS": "Israeli New Sheqel", 
    "INR": "Indian Rupee", 
    "ISK": "Icelandic Krona", 
    "JPY": "Japanese Yen", 
    "KES": "Kenyan Shillings", 
    "KRW": "South Korean Won", 
    "KWD": "Kuwaiti Dinar", 
    "MAD": "Moroccan Dirham", 
    "MUR": "Mauritian Rupee", 
    "MXN": "Mexican Peso", 
    "MYR": "Malaysian Ringgit", 
    "NGN": "Nigerean Naira", 
    "NOK": "Norwegian Krone", 
    "NZD": "New Zealand Dollar", 
    "OMR": "Omani Rial", 
    "PEN": "Peruvian Nuevo Sol", 
    "PHP": "Philippine Peso", 
    "PLN": "Polish Zloty", 
    "QAR": "Qatari Rial", 
    "RON": "Romanian Leu", 
    "RUB": "Russian Ruble", 
    "SAR": "Saudi Arabian Riyal", 
    "SEK": "Swedish Krona", 
    "SGD": "Singapore Dollar", 
    "THB": "Thai Baht", 
    "TRY": "Turkish Lira", 
    "TWD": "Taiwanese Dollar", 
    "USD": "US Dollar", 
    "VND": "Vietnamese Dong", 
    "XAG": "Silver (troy ounce)", 
    "XAU": "Gold (troy ounce)", 
    "XOF": "West African CFA franc", 
    "XPD": "Palladium", 
    "XPT": "Platinum", 
    "ZAR": "South African Rand", 
    "ZWL": "Zimbabwean Dollar"
  },
  currencies: [],
      currency: {
        from: 'EUR',
        to: 'USD'
      },
      seriesArea: [
        {
          name: "",
          data: [],
        },
      ],
      times: [],
    };
  },
  watch: {
    period(val) {
      console.log(this.periods[val])
      // this.getLiveCurrencyExchange(this.periods[val])
    },
    'currency': {
      handler(val) {
        console.log(val)
      },
      deep: true
    }
  },
  computed: {
    optionsArea() {
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
          // enabledOnSeries: undefined,
          // shared: true,
          // followCursor: false,
          intersect: false,
          // inverseOrder: false,
          // custom: undefined,
          // fillSeriesColor: false,
          // theme: false,
          // style: {
          //   fontSize: "12px",
          //   fontFamily: undefined,
          // },
          onDatasetHover: {
            highlightDataSeries: true,
          },
          x: {
            formatter: undefined,
          },
          y: {
            formatter: undefined,
            // title: {
            //   formatter: (seriesName) => seriesName + ' %',
            // },
          },
          marker: {
            show: true,
          },
        },
      };
    },
    nowDate() {
      return moment().format("YYYY-MM-DD");
    },
    nowDateWithHHMM() {
      return moment().format("YYYY-MM-DD-HH:MM");
    },
  },
  methods: {
    getCurrencies() {
      // Axios.get(
      //   "https://marketdata.tradermade.com/api/v1/live_currencies_list?api_key=eOfPku3ezlOjlMitRDuU"
      // )
      //   .then((response) => {
          for (const currencyCode in this.currenciesObj) {
            this.currencies.push({
              value: currencyCode,
              text: this.currenciesObj[currencyCode]
            })
          }
        
        // .catch((error) => {
        //   console.log(error);
        // });
    },
    /* eslint-disable */
    getLiveCurrencyExchange(start={time: 1, unit: 'months'}, interval, currencies="EURUSD") {
      /*
        start: Object {time: integetr, unit: string [months, weeks, days, hours, minutes...]}
        interval: string [daily, hourly, minute]
      */
      let now = new Date();
      let nowTime = moment(now).subtract(3, "hours");
      let startTime = nowTime
        .subtract(start.time, start.unit)
        .format("YYYY-MM-DD-HH:MM");
      let timeNow = nowTime.format("YYYY-MM-DD-HH:MM");
      Axios.get(
        `https://marketdata.tradermade.com/api/v1/timeseries?currency=${currencies}&api_key=eOfPku3ezlOjlMitRDuU&start_date=${startTime}&end_date=${timeNow}&format=records&interval=${interval}`
      )
        .then((response) => {
          response.data.quotes.forEach((el) => {
            this.seriesArea[0].data.push(el.close);
            this.times.push(el.date);
          });
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.chartLoading = false;
        });
    },
    goToForexSite() {
      window.open("https://forex.com", "_blank");
    },
  },
  created() {
    this.getCurrencies()
    // setTimeout(() => {
    //   this.getLiveCurrencyExchange()
    // }, 1000);
    let now = new Date();
    let start = {
      time: 10,
      unit: "hours",
    };
    let startTime = moment(now)
      .subtract(3, "hours")
      .subtract(parseInt(start.time), start.unit)
      .format("YYYY-MM-DD-HH:MM");
    let timeNow = moment(now).subtract(3, "hours").format("YYYY-MM-DD-HH:MM");
    console.log(startTime, timeNow);
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
</style>
