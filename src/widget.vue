<template>

  <div class="container" v-bind:style="styleObject">
    <div class="actions_row">
        <div class="act_back">
            <a class="button" v-bind:style="btnStyle" v-show="page!=0" @click="prevPage()" align=left>{{translations[lang].back}}</a>
        </div>
        <div class="act_search">
            <input type="text" :placeholder="translations[lang].search" v-on:input="doSearch()" v-model="search_q">
        </div>
        <div class="act_next">
            <a class="button" v-bind:style="btnStyle" v-show="page < (totalPages - 1)" @click="nextPage()">{{translations[lang].next}}</a>
        </div>
    </div>

    <!-- Tracks -->
    <div v-show="!nothingFound && !loading" class="track" v-for="track in tracks" :key="track.id" v-bind:style="trackStyle">
            <img v-bind:src="track.image" @click="requestTrack(track)" v-bind:style="trackImgStyle">
            <div class="meta" v-bind:style="metaStyle">{{ track.meta }}</div>
            <a class="button" v-bind:style="btnStyle" @click="requestTrack(track)">{{translations[lang].requestTrack}}</a>
    </div>

    <!-- Loading spinner -->
    <div v-show="loading" class="spinner">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
    </div>

    <!-- Pagination -->
    <paginate
        :page-count="totalPages"
        :click-handler="setPage"
        :page-range="3"
        :margin-pages="2"
        :prev-text="translations[lang].paginatePrev"
        :next-text="translations[lang].paginateNext"
        :container-class="'pagination'"
        :page-class="'page-item'"
        :next-class="'page-item'"
        :prev-class="'page-item'"
        :page-link-class="'page-item'"
        :no-li-surround="true">
    </paginate>

    <div v-show="nothingFound">{{translations[lang].nothingFound}}</div>
    <div v-show="loadError">{{translations[lang].loadError}}</div>

    <!-- Modal dialog -->
    <transition name="modal">
        <div class="modal-mask" v-show="showModal">
            <div class="modal-wrapper">
                <div class="modal-container" v-bind:style="modalStyle">

                    <div class="modal-header">{{translations[lang].trackrequestModalTitle}}</div>

                    <div class="modal-body" v-if="selectedTrack">
                        <div class="track-info">
                            <div><label>{{translations[lang].trackArtist}}:</label> {{selectedTrack.author}}</div>
                            <div><label>{{translations[lang].trackTitle}}:</label> {{selectedTrack.title}}</div>
                        </div>
                        <div v-if="allow_person_and_message == 'true'" class="feedback">
                            <div><label>{{translations[lang].listenerName}}:</label></div>
                            <div><input type="text" v-model="name" @input="updateCharactersLeftName()"></div>
                            <div><label>{{translations[lang].listenerMessage}}:</label></div>
                            <div><textarea v-model="message"  @input="updateCharactersLeftMessage()"></textarea></div>
                            <div>{{translations[lang].charactersLeft}}: {{charactersLeft}}</div>
                        </div>
                    </div>

                    <div v-if="trackRequestSuccessfull" class="modal-message success">
                        {{translations[lang].trackRequestSuccessfull}}
                    </div>

                    <div v-if="trackRequestUnsuccessfull" class="modal-message error">
                        <div v-if="trackRequestFailure">
                            {{translations[lang].trackRequestFailure}}
                        </div>
                        <div v-if="trackRequestBlocked">
                            {{translations[lang].trackRequestBlocked}}
                        </div>
                        <div v-if="trackRequestBlockedIp">
                            {{translations[lang].trackRequestBlockedIp}}
                        </div>
                    </div>


                    <div class="modal-footer">
                        <button class="button" v-bind:style="btnStyle" v-if="selectedTrack" @click="sendRequest()">{{translations[lang].trackrequestModalSubmit}}</button>
                        <button class="button" v-bind:style="btnStyle" @click="showModal=false;">
                            <span v-if="selectedTrack">
                                {{translations[lang].trackrequestModalCancel}}
                            </span>

                            <span v-if="!selectedTrack && (trackRequestSuccessfull || trackRequestUnsuccessfull)">
                                {{translations[lang].trackrequestModalClose}}
                            </span>

                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
  </div>

</template>

<script>
import axios from "axios";
import debounce from "debounce";

export default {
  props: [
    "apiBase",
    "serverId",
    "lang",
    "bgcolor",
    "bgopacity",
    "tracks_num",
    "track_width",
    "track_image_default",
    "meta_font_size",
    "meta_font_style",
    "meta_font_color",
    "meta_opacity",
    "button_color",
    "button_font_color",
    "button_font_size",
    "ordering",
    "allow_person_and_message",
    "modal_background_color",
    "modal_font_color",
    "modal_background_opacity"
  ],
  data() {
    return {
      translations: {
        en: {
          back: "Previous",
          next: "Next",
          search: "Search",
          request: "Request",
          nothingFound: "Nothing found",
          loadError: "There was an error while trying to load music",
          requestTrack: "Request",
          paginatePrev: "Prev",
          paginateNext: "Next",
          trackrequestModalTitle: "Track request",
          trackrequestModalSubmit: "Submit",
          trackrequestModalCancel: "Cancel",
          trackArtist: "Artist",
          trackArtist: "Title",
          listenerName: "Your name",
          listenerMessage: "Shoutout",
          charactersLeft: "Characters left",
          trackRequestSuccessfull:
            "Your track request has been sent successfully.",
          trackrequestModalClose: "Close",
          trackRequestFailure: "Request failed, please try again later.",
          trackRequestBlocked:
            "This track has already been requested recently, please try again later.",
          trackRequestBlockedIp:
            "You have already made a request recently, please try again later."
        },
        ru: {
          back: "Назад",
          next: "Вперед",
          search: "Поиск",
          request: "Заказать",
          nothingFound: "Ничего не найдено",
          loadError: "Ошибка загрузки трэков",
          requestTrack: "Заказать",
          paginatePrev: "Назад",
          paginateNext: "Вперед",
          trackrequestModalTitle: "Заказ песни",
          trackrequestModalSubmit: "Отправить",
          trackrequestModalCancel: "Отмена",
          trackArtist: "Исполнитель",
          trackTitle: "Название",
          listenerName: "Представьтесь",
          listenerMessage: "Сообщение в эфир",
          charactersLeft: "Осталось сиволов",
          trackRequestSuccessfull: "Ваша заявка успешно отправлена.",
          trackrequestModalClose: "Закрыть",
          trackRequestFailure: "Ошибка, попробуйте повторить позже.",
          trackRequestBlocked:
            "Этот трэк уже был заказан недавно, попробуйте повторить запрос позже.",
          trackRequestBlockedIp:
            "Вы уже заказывали трэк недавно, попробуйте повторить запрос позже."
        }
      },
      page: 0,
      offset: 10,
      search_q: "",
      tracks: [],
      totalPages: 0,
      loadError: false,
      loading: false,
      nothingFound: false,
      showModal: false,
      maxMessageLength: 10,
      selectedTrack: null,
      charactersLeft: 10,
      ipTimeout: 0,
      trackTimeout: 0,
      trackRequestSuccessfull: false,
      trackRequestUnsuccessfull: false,
      name: "",
      message: "",
      styleObject: {},
      trackImageFailover: ""
    };
  },
  methods: {
    hexToRgb: function(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          }
        : null;
    },
    resetRequestData() {
      this.trackRequestUnsuccessfull = this.trackRequestSuccessfull = this.trackRequestBlocked = this.trackRequestBlockedIp = this.trackRequestFailure = false;
    },
    sendRequest() {
      let url = `${this.apiBase}/track_requests/`;
      let data = {
        server_id: this.serverId,
        person: this.name,
        message: this.message,
        music_id: this.selectedTrack.id
      };
      this.resetRequestData();
      axios
        .post(url, data)
        .then(response => {
          this.trackRequestSuccessfull = true;
          this.selectedTrack = null;
        })
        .catch(e => {
          this.trackRequestUnsuccessfull = true;
          /// Track blocked
          if (e.response.data && e.response.data.track_blocked) {
            this.trackRequestBlocked = true;
          } else if (e.response.data && e.response.data.ip_blocked) {
            /// Ip blocked
            this.trackRequestBlockedIp = true;
          } else {
            // General error
            this.trackRequestFailure = true;
          }
          this.selectedTrack = null;
        });
    },
    updateCharactersLeftName() {
      this.charactersLeft =
        this.maxMessageLength - (this.name.length + this.message.length);
      if (this.charactersLeft <= 0) {
        this.name = this.name.substring(0, this.name.length - 1);
      }
    },
    updateCharactersLeftMessage() {
      this.charactersLeft =
        this.maxMessageLength - (this.name.length + this.message.length);
      if (this.charactersLeft <= 0) {
        this.message = this.message.substring(0, this.message.length - 1);
      }
    },
    requestTrack(track) {
      this.resetRequestData();
      this.selectedTrack = track;
      this.showModal = true;
    },
    doSearch: debounce(function() {
      this.page = 0;
      this.loadTracks();
    }, 300),
    prevPage() {
      this.flipPage(-1);
    },
    nextPage() {
      this.flipPage(1);
    },
    setPage(page) {
      this.page = page - 1;
      this.loadTracks();
    },
    flipPage(direction) {
      this.page += direction;
      if (this.page < 0) {
        this.page = 0;
      }
      this.loadTracks();
    },
    loadTracks() {
      let url = `${this.apiBase}/music/?limit=${this.tracks_num}&offset=${this
        .tracks_num * this.page}&search_q=${this.search_q}&server=${this
        .serverId || 1}&with_tags_only=true&order=${this.ordering}`;

      this.loading = true;
      axios
        .get(url)
        .then(response => {
          if (
            response.data &&
            response.data.results &&
            response.data.results.length
          ) {
            this.tracks = response.data.results;
            // Set images
            if (this.tracks.length) {
              for (let track of this.tracks) {
                track.image =
                  track.image_medium ||
                  track.tag_image ||
                  this.trackImageFailover;
              }
            }

            this.totalPages = Math.ceil(response.data.count / this.tracks_num);
            this.nothingFound = false;
          } else if (response.data.count === 0) {
            this.tracks = [];
            this.totalPages = 0;
            this.nothingFound = true;
          }
          this.loading = false;
        })
        .catch(e => {
          this.loadError = true;
          this.nothingFound = false;
          this.loading = false;
        });
    }
  },
  created() {
    // Create styles
    let rgbBg = this.hexToRgb(this.bgcolor);
    this.styleObject = {
      "background-color": `rgba(${rgbBg.r}, ${rgbBg.g}, ${rgbBg.b}, ${this
        .bgopacity})`
    };

    this.trackStyle = {
      width: this.track_width + "px"
    };
    this.trackImgStyle = {
      "min-height": this.track_width + "px",
      "max-height": this.track_width + "px"
    };

    this.trackImageFailover = this.track_image_default;

    // Metadata styling
    let rgbMeta = this.hexToRgb(this.meta_font_color);
    this.metaStyle = {
      "font-size": `${this.meta_font_size}px`,
      color: `rgba(${rgbMeta.r}, ${rgbMeta.g}, ${rgbMeta.b}, ${this
        .meta_opacity})`,
      "font-style": this.meta_font_style
    };
    // Button styling
    let rgbButton = this.hexToRgb(this.button_color);

    let rgbButtonFont = this.hexToRgb(this.button_font_color);

    this.btnStyle = {
      "font-size": `${this.button_font_size}px`,
      "background-color": `rgb(${rgbButton.r}, ${rgbButton.g}, ${rgbButton.b})`,
      color: `rgb(${rgbButtonFont.r}, ${rgbButtonFont.g}, ${rgbButtonFont.b})`
    };

    // Modal window
    let rgbModal = this.hexToRgb(this.modal_background_color);
    let rgbModalFont = this.hexToRgb(this.modal_font_color);

    this.modalStyle = {
      "background-color": `rgba(${rgbModal.r}, ${rgbModal.g}, ${rgbModal.b}, ${this
        .modal_background_opacity})`,
      color: `rgb(${rgbModalFont.r}, ${rgbModalFont.g}, ${rgbModalFont.b})`
    };

    this.loadTracks();
  }
};
</script>

<style scoped>
.container {
  text-align: center;
  width: 100%;
  margin: 0 auto;
  padding: 10px;
}

.track {
  display: inline-block;
  margin: 20px 10px 10px 10px;
  width: 180px;
  vertical-align: top;
}

.track img {
  clear: both;
  min-height: 180px;
  max-width: 100%;
  max-height: 180px;
}
.actions_row {
  margin: 10px;
}
.act_back {
  width: 16%;
  text-align: left;
  display: inline-block;
}
.act_search {
  width: 60%;
  text-align: center;
  display: inline-block;
}

.act_next {
  width: 16%;
  text-align: right;
  display: inline-block;
}

.pagination {
  padding: 15px 5px;
  text-align: center;
  font-weight: 700;
}

.pagination>>>a {
  font-weight: 700;
  border-radius: 3px;
  text-align: center;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  border: 0;
  background-color: #8d9ca3;
  color: #fff;
  font-size: 14px;
  padding: 5px 10px;
  text-shadow: none;
  text-decoration: none;
  font-family: Arial, Helvetica, sans-serif;
  display: inline-block;
  margin: 3px 5px;
}
.pagination>>>a.active {
  background-color: #bdbf91;
}

.meta {
  height: 3em;
  line-height: 1em;
  overflow: hidden;
}

.button {
  font-weight: 700;
  border-radius: 2px;
  text-align: center;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  border: 0;
  background-color: #8d9ca3;
  color: #fff;
  font-size: 14px;
  padding: 5px 15px;
  text-shadow: none;
  text-decoration: none;
  font-family: Arial, Helvetica, sans-serif;
}

.track-info {
  margin: 10px;
  text-align: left;
}

.modal-body label {
  font-weight: bold;
}

.feedback {
  margin: 10px;
  text-align: left;
}

.feedback input {
  font-size: 22px;
}

.feedback textarea {
  font-size: 22px;
}

.modal-message {
  margin: 20px;
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
}

.success {
  color: #155724;
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.error {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.spinner {
  width: 180px;
  height: 180px;
  position: relative;
  margin: 100px auto;
}

.double-bounce1,
.double-bounce2 {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #333;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;

  -webkit-animation: sk-bounce 2s infinite ease-in-out;
  animation: sk-bounce 2s infinite ease-in-out;
}

.double-bounce2 {
  -webkit-animation-delay: -1s;
  animation-delay: -1s;
}

@-webkit-keyframes sk-bounce {
  0%,
  100% {
    -webkit-transform: scale(0);
  }
  50% {
    -webkit-transform: scale(1);
  }
}

@keyframes sk-bounce {
  0%,
  100% {
    transform: scale(0);
    -webkit-transform: scale(0);
  }
  50% {
    transform: scale(1);
    -webkit-transform: scale(1);
  }
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 25%;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-header {
  margin-top: 0;
  font-size: 25px;
  font-weight: bold;
}

.modal-body {
  margin: 20px 0;
}

/* Modal animation */
.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>