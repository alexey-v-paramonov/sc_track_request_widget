<template>

  <div class="container" v-bind:style="styleObject">
    <div class="actions_row">
        <div class="act_search">
            <input type="text" :placeholder="translations[language].search" v-on:input="doSearch()" v-model="search_q">
        </div>
    </div>

    <!-- Tracks -->
    <div v-show="!nothingFound && !loading" class="track" v-for="track in tracks" :key="track.id" v-bind:style="trackStyle">
            <img v-bind:src="track.image" @click="requestTrack(track)" v-bind:style="trackImgStyle">
            <div class="meta" v-bind:style="metaStyle">{{ track.meta }}</div>
            <a class="button" v-bind:style="btnStyle" @click="requestTrack(track)">{{translations[language].requestTrack}}</a>
    </div>

    <!-- Loading spinner -->
    <div v-show="loading" class="spinner">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
    </div>

    <div></div>
    <!-- Pagination -->
    <paginate v-show="!loading && tracks.length > 0 && totalPages > 1"
        :page-count="totalPages"
        :click-handler="setPage"
        :page-range="3"
        :margin-pages="2"
        :prev-text="translations[language].paginatePrev"
        :next-text="translations[language].paginateNext"
        :container-class="'pagination-v-82963a40'"
        :page-class="'page-item'"
        :next-class="'page-item'"
        :prev-class="'page-item'"
        :page-link-class="'page-item'"
        :no-li-surround="true">
    </paginate>

    <div v-show="nothingFound">{{translations[language].nothingFound}}</div>
    <div v-show="loadError">{{translations[language].loadError}}</div>

    <!-- Modal dialog -->
    <transition name="modal">
        <div class="modal-mask" v-show="showModal">
            <div class="modal-wrapper">
                <div class="modal-container" v-bind:style="modalStyle">

                    <div class="modal-header">{{translations[language].trackrequestModalTitle}}</div>

                    <div class="modal-body" v-if="selectedTrack">
                        <div class="track-info">
                            <div><label>{{translations[language].trackArtist}}:</label> {{selectedTrack.author}}</div>
                            <div><label>{{translations[language].trackTitle}}:</label> {{selectedTrack.title}}</div>
                        </div>
                        <div v-if="allow_person_and_message == 'true'" class="feedback">
                            <div><label>{{translations[language].listenerName}}:</label></div>
                            <div><input type="text" v-model="name" @input="updateCharactersLeftName()" maxlength="255"></div>
                            <div><label>{{translations[language].listenerMessage}}:</label></div>
                            <div><textarea v-model="message"  @input="updateCharactersLeftMessage()" maxlength="255"></textarea></div>
                            <div>{{translations[language].charactersLeft}}: {{charactersLeft}}</div>
                        </div>
                    </div>

                    <div v-if="trackRequestSuccessfull" class="modal-message success">
                        {{translations[language].trackRequestSuccessfull}}
                    </div>

                    <div v-if="trackRequestUnsuccessfull && trackRequestFailure" class="modal-message error">
                            {{translations[language].trackRequestFailure}}
                    </div>

                    <div v-if="trackRequestUnsuccessfull && trackRequestBlocked" class="modal-message error">
                            {{translations[lang].trackRequestBlocked}}
                    </div>

                    <div v-if="trackRequestUnsuccessfull && trackRequestBlockedIp" class="modal-message error">
                            {{translations[language].trackRequestBlockedIp}}
                    </div>

                    <div class="modal-footer">
                        <button class="button" v-bind:style="btnStyle" v-if="selectedTrack" @click="sendRequest()">{{translations[language].trackrequestModalSubmit}}</button>
                        <button class="button" v-bind:style="btnStyle" @click="showModal=false;">
                            <span v-if="selectedTrack">
                                {{translations[language].trackrequestModalCancel}}
                            </span>

                            <span v-if="!selectedTrack && (trackRequestSuccessfull || trackRequestUnsuccessfull)">
                                {{translations[language].trackrequestModalClose}}
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
    "button_color_active",
    "button_font_size",
    "ordering",
    "allow_person_and_message",
    "modal_background_color",
    "modal_font_color",
    "modal_background_opacity",
    'ipTimeout',
    'trackTimeout',
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
          trackTitle: "Title",
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
        br: {
            back: "Anterior",
            next: "Próximo",
            search: "Buscar",
            request: "Pedir",
            nothingFound: "Nada encontrado",
            loadError: "Ocorreu um erro ao tentar carregar a música",
            requestTrack: "Pedir",
            paginatePrev: "Voltar",
            paginateNext: "Avançar",
            trackrequestModalTitle: "Pedir faixa",
            trackrequestModalSubmit: "Enviar",
            trackrequestModalCancel: "Cancelar",
            trackArtist: "Artista",
            trackTitle: "Título",
            listenerName: "Seu nome",
            listenerMessage: "Mensagem",
            charactersLeft: "Characteres restantes",
            trackRequestSuccessfull: "Seu pedido foi enviado com sucesso.",
            trackrequestModalClose: "Fechar",
            trackRequestFailure: "Falha no pedido, por favor tente mais tarde.",
            trackRequestBlocked: "Esta faixa já foi pedida recentimente, por favor tente mais tarde.",
            trackRequestBlockedIp: "Você já fez um pedido recentimente, por favor tente mais tarde.",
        },
        pt: {
            back: "Anterior",
            next: "Próximo",
            search: "Buscar",
            request: "Pedir",
            nothingFound: "Nada encontrado",
            loadError: "Ocorreu um erro ao tentar carregar a música",
            requestTrack: "Pedir",
            paginatePrev: "Voltar",
            paginateNext: "Avançar",
            trackrequestModalTitle: "Pedir faixa",
            trackrequestModalSubmit: "Enviar",
            trackrequestModalCancel: "Cancelar",
            trackArtist: "Artista",
            trackTitle: "Título",
            listenerName: "Seu nome",
            listenerMessage: "Mensagem",
            charactersLeft: "Characteres restantes",
            trackRequestSuccessfull: "Seu pedido foi enviado com sucesso.",
            trackrequestModalClose: "Fechar",
            trackRequestFailure: "Falha no pedido, por favor tente mais tarde.",
            trackRequestBlocked: "Esta faixa já foi pedida recentimente, por favor tente mais tarde.",
            trackRequestBlockedIp: "Você já fez um pedido recentimente, por favor tente mais tarde.",
        },
        fr: {
          back: "Précédent",
          next: "Suivant",
          search: "Recherche",
          request: "Demande",
          nothingFound: "Rien n'a été trouvé",
          loadError: "Une erreur s'est produite lors du chargement de la musique",
          requestTrack: "Requête",
          paginatePrev: "Préc",
          paginateNext: "Suiv",
          trackrequestModalTitle: "Demande de musique",
          trackrequestModalSubmit: "Soumettre",
          trackrequestModalCancel: "Annuler",
          trackArtist: "Artiste",
          trackTitle: "Titre",
          listenerName: "Votre nom",
          listenerMessage: "Message",
          charactersLeft: "Caractères restants",
          trackRequestSuccessfull:
            "Votre demande de piste a été envoyée avec succès.",
          trackrequestModalClose: "Fermer",
          trackRequestFailure: "La demande a échoué, veuillez réessayer plus tard.",
          trackRequestBlocked:
            "Cette piste a déjà été demandée récemment, veuillez réessayer plus tard.",
          trackRequestBlockedIp:
            "Vous avez déjà fait une demande récemment, veuillez réessayer plus tard."
        },
        de: {
          back: "Zurück",
          next: "Weiter",
          search: "Suchen",
          request: "Wünschen",
          nothingFound: "Nichts gefunden",
          loadError: "Beim Laden von Musik ist ein Fehler aufgetreten",
          requestTrack: "Wünschen",
          paginatePrev: "Zurück",
          paginateNext: "Weiter",
          trackrequestModalTitle: "Titel wünschen",
          trackrequestModalSubmit: "Einreichen",
          trackrequestModalCancel: "Abbrechen",
          trackArtist: "Künstler",
          trackTitle: "Titel",
          listenerName: "Name",
          listenerMessage: "Shoutout",
          charactersLeft: "Verbleibende Zeichen",
          trackRequestSuccessfull:
            "Der Wunsch wurde erfolgreich gesendet.",
          trackrequestModalClose: "Schließen",
          trackRequestFailure: "Anfrage fehlgeschlagen, bitte versuchen Sie es später noch einmal.",
          trackRequestBlocked:
            "Dieser Titel wurde bereits vor kurzem gewünscht, bitte versuchen Sie es später noch einmal.",
          trackRequestBlockedIp:
            "Sie haben bereits eine Anfrage gestellt. Bitte versuchen Sie es später noch einmal."
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
      maxMessageLength: 300,
      selectedTrack: null,
      charactersLeft: 300,
      trackRequestSuccessfull: false,
      trackRequestUnsuccessfull: false,
      name: "",
      message: "",
      language: "en",
      trackImageFailover: ""
    };
  },
  mounted() {
        window.sc_vueTrackRequestWidget = this;
  },
  methods: {
    setLang(language){
        this.language = language;
    },
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
        music_id: this.selectedTrack.id,
        ip_timeout: this.ipTimeout,
        track_timeout: this.trackTimeout,
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
        .serverId || 1}&with_tags_only=true&requestable=true&order=${this.ordering}`;

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
    // Language
    this.language = this.lang;
    // Create styles
    let rgbBg = this.hexToRgb(this.bgcolor);
    this.styleObject = {
      "background-color": `rgba(${rgbBg.r}, ${rgbBg.g}, ${rgbBg.b}, ${this.bgopacity})`
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
    //let rgbActiveButton = this.hexToRgb(this.button_color_active);
    let rgbButtonFont = this.hexToRgb(this.button_font_color);

    this.btnStyle = {
      "font-size": `${this.button_font_size}px`,
      "background-color": `rgb(${rgbButton.r}, ${rgbButton.g}, ${rgbButton.b})`,
      color: `rgb(${rgbButtonFont.r}, ${rgbButtonFont.g}, ${rgbButtonFont.b})`
    };

   // Programmatically generate pagination button styles
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.pagination-v-82963a40 { padding: 15px 5px; text-align: center; font-weight: 700; }\n';
    style.innerHTML += `.pagination-v-82963a40 a { font-weight: 700; border-radius: 0px; text-align: center; cursor: pointer; outline: none; box-sizing: border-box; border: 0; background-color: ${this.button_color}; color: ${this.button_font_color}; font-size: ${this.button_font_size}px; padding: 5px 10px; text-shadow: none; text-decoration: none; font-family: Arial, Helvetica, sans-serif; display: inline-block; margin: 3px 5px; }\n`;
    style.innerHTML += `.pagination-v-82963a40 a.active { background-color: ${this.button_color_active}}`;

    document.getElementsByTagName('head')[0].appendChild(style);


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

/*
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
*/
.meta {
  height: 3em;
  line-height: 1em;
  overflow: hidden;
}

.button {
  font-weight: 700;
  /*border-radius: 2px;*/
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
  width: 100%;
}

.feedback textarea {
  font-size: 22px;
  width: 100%;
}

.modal-message {
  margin: 20px;
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  display: block;
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
  position: absolute;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: block;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  /*display: table-cell;*/
  vertical-align: middle;
  position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    transform: translate(-50%,-50%);
}

.modal-container {
  width: 25%;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  z-index: 9998;
}

@media (max-width: 1024px) {
  .modal-container {
    width: 90%;
    padding: 10px 10px;
  }
  .feedback {
    margin: 0px;
  }
  .track-info {
    margin: 0px;
  }
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
