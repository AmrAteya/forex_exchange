import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

const vuetify = new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#521efc',
        secondary: '#b0bec5',
        info: '#55e063',
      },
    },
  },
})

export default vuetify