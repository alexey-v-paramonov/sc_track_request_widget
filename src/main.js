import Vue from 'vue'
import TrackRequestWidget from './widget'
import Paginate from 'vuejs-paginate';

Vue.component('paginate', Paginate)


Vue.config.productionTip = false

new Vue({
  el: '.sc-track-request-widget',
  //render: h => h(TrackRequestWidget)
  components: { TrackRequestWidget },
})
