<template>
  <!-- <q-page class="row items-center justify-evenly">
    <channel-messages-component :messages="messages" />
  </q-page> -->

  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark text-white">
      <q-resize-observer @resize="onResize"></q-resize-observer>
      <q-toolbar v-if="!showTopHamburger">
        <q-toolbar-title class="col-md-3">
          <q-avatar>
            <img src="https://cdn.quasar.dev/img/avatar5.jpg" />
          </q-avatar>
          {{ loggedInUserName }}
          <q-icon name="fiber_manual_record" color="green"></q-icon>
          <q-btn-dropdown flat color="primary" label="Status">
            <q-list>
              <q-item clickable v-close-popup>
                <q-item-section>
                  <q-item-label>Online</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="fiber_manual_record" color="green"></q-icon>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>
                  <q-item-label>DND</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="fiber_manual_record" color="yellow"></q-icon>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>
                  <q-item-label>Offline</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="fiber_manual_record" color="red"></q-icon>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-toolbar-title>

        <!-- :dense="dense" -->
        <!-- <q-input
          borderless
          bottom-slots
          v-model="channelSearchQuery"
          label="Search channels..."
          maxlength="12"
          class="col-md-6 q-pa-none"
        >
          <template v-slot:append>
            <q-icon name="search"></q-icon>
          </template>
        </q-input> -->

        <div class="col-md-9 row items-center justify-end">
          <q-btn to="/login" label="Log out" class="bg-negative"></q-btn>
        </div>
      </q-toolbar>
      <q-toolbar v-if="showTopHamburger">
        <div class="column q-pt-sm" style="width: 100vw">
          <div class="row">
            <div class="col-12">
              <q-avatar>
                <img src="https://cdn.quasar.dev/img/avatar5.jpg" />
              </q-avatar>
              {{ loggedInUserName }}
              <q-icon name="fiber_manual_record" color="green"></q-icon>
              <q-btn-dropdown
                flat
                color="primary"
                label="Status"
                style="float: right"
              >
                <q-list>
                  <q-item clickable v-close-popup>
                    <q-item-section>
                      <q-item-label>Online</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="fiber_manual_record" color="green"></q-icon>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section>
                      <q-item-label>DND</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon
                        name="fiber_manual_record"
                        color="yellow"
                      ></q-icon>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section>
                      <q-item-label>Offline</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="fiber_manual_record" color="red"></q-icon>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </div>

          <div class="row">
            <!-- :dense="dense" -->
            <!-- <q-input
              borderless
              bottom-slots
              v-model="channelSearchQuery"
              label="Search channels..."
              maxlength="12"
              class="col-8 q-pa-none"
            >
              <template v-slot:append>
                <q-icon name="search"></q-icon>
              </template>
            </q-input> -->

            <div class="col-12 row items-center justify-end">
              <q-btn @click="logout" label="Log out" class="bg-negative"></q-btn>
            </div>
          </div>
        </div>
      </q-toolbar>
      <div class="row items-center q-pa-sm" v-if="showTopHamburger">
        <q-list class="rounded-borders">
          <q-expansion-item
            icon="menu"
            label="Menu"
            class="topDropDown"
            @click="toggleHamburgerMenu"
          >
            <q-card
              class="q-pa-none"
              style="max-height: 450px; overflow-y: scroll"
            >
              <q-card-section class="q-pa-none">
                <div class="row" style="width: 95vw">
                  <div class="col-xs-12 col-5">
                    <LeftDrawer />
                  </div>
                  <div class="col-xs-12 col-6 q-mt-lg">
                    <RightDrawer />
                    <!-- q-ml-sm-lg  -->
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </div>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <LeftDrawer />
    </q-drawer>

    <q-drawer
      show-if-above
      v-model="rightDrawerOpen"
      side="right"
      bordered
      class="q-pa-md"
    >
      <RightDrawer />
    </q-drawer>

    <q-page-container style="height: 100vh">
      <div class="q-pa-sm column" style="height: 100%; overflow: hidden">
        <q-scroll-area ref="chatArea"
          class="justify-center"
          :class="getMessageAreaHeight(isHamburgerOpen, typingCount)"
        >
          <q-chat-message v-for="message in messages"
            v-bind:key="message.id"
            :name="message.author.email"
            :text="[message.content]"
            :stamp="message.createdAt"
            :sent="isMine(message)"
            :bg-color="getColor(message)"
            :text-color="isMine(message) ? 'white' : 'black'"
            size="6"
            :avatar="getAuthorPicture()"
          />
        </q-scroll-area>
        <div v-if="typingCount == 1" class="col-1 q-ml-md special-zone">
          <q-spinner-dots size="2rem"></q-spinner-dots>
          <q-btn
            flat
            unelevated
            text-color="white"
            class="q-ml-sm no-hover-state"
            label="Doe is typing..."
          >
            <q-tooltip> The currenlty typed text by the other user </q-tooltip>
          </q-btn>
        </div>
        <div v-if="typingCount > 1" class="col-1 q-ml-md">
          <q-spinner-dots size="2rem"></q-spinner-dots>
          <span class="q-ml-sm">Multiple people are typing...</span>
        </div>
        <div :class="[isHamburgerOpen ? 'col-2' : 'col-1']">
          <q-input
            outlined
            bottom-slots
            v-model="newMessageText"
            label="Enter your message here..."
            counter
            maxlength="128"
            :dense="!isHamburgerOpen"
            class="col-md-12"
          >
            <template v-slot:before>
              <q-avatar>
                <img src="https://cdn.quasar.dev/img/avatar5.jpg" />
              </q-avatar>
            </template>

            <template v-slot:after>
              <q-btn round dense flat icon="send" :disable="loading" @click="send"></q-btn>
            </template>
          </q-input>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { SerializedMessage } from 'src/contracts'
import { defineComponent, ref } from 'vue'
import LeftDrawer from 'src/components/LeftDrawer.vue'
import RightDrawer from '../components/RightDrawer.vue'
import { Dimension } from '../components/models'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { QScrollArea } from 'quasar'

export default defineComponent({
  components: { LeftDrawer, RightDrawer },
  name: 'ChannelPage',
  computed: {
    messages (): SerializedMessage[] {
      return this.$store.getters['channels/currentMessages']
    },
    ...mapGetters('channels', {
      channels: 'joinedChannels',
      lastMessageOf: 'lastMessageOf'
    }),
    ...mapGetters('auth', {
      loggedInUserName: 'getUserName',
    }),
    activeChannel () {
      //console.log('Active channel is: ' + this.$store.state.channels.active)
      return this.$store.state.channels.active
    },
    currentUser () {
      return this.$store.state.auth.user?.id
    },
    getCurrentUser () {
      return this.$store.state.auth.user
    }
  },
  watch: {
    messages: {
      handler () {
        this.$nextTick(() => this.scrollMessages())
      },
      deep: true
    }
  },
  data () {
    return {
      isHamburgerOpen: false,
      showTopHamburger: false,
      // channelSearchQuery: '',
      leftDrawerOpen: true,
      rightDrawerOpen: true,
      newMessageText: '',
      loading: false,

      model: ref(null),
      openedChannel: {
        index: 0,
        name: 'Channel X'
      },
      typingCount: 2
    }
  },
  methods: {
    isUserTagged (message:string) {
      // :class="isUserTagged(message.content) ? 'mentionedMessage' : ''"
      const words = message.split(' ')
      const ownMentionTag = '#' + this.$store.state.auth.user?.username
      
      let found = false
      words.forEach(word => {
        // console.log(word + '/' + ownMentionTag)
        if (word == ownMentionTag && !found){
          // console.log(message + '/' + ownMentionTag + ' FOUND')
          found = true
        } 
      })
      
      // console.log(message + '/' + ownMentionTag + ' FALSE')
      return found
    },
    getMessageAreaHeight: (
      isHamburgerOpen: boolean,
      typingCount: number
    ): string => {
      if (isHamburgerOpen && typingCount === 0) return 'col-10'
      else if (isHamburgerOpen && typingCount > 0) return 'col-9'
      else if (!isHamburgerOpen && typingCount > 0) return 'col-10'
      else if (!isHamburgerOpen && typingCount === 0) return 'col-11'
      else return 'col-8'
    },
    onResize (size: Dimension) {
      if (size.width < 1024) {
        this.showTopHamburger = true
      } else {
        this.showTopHamburger = false
      }
    },
    toggleHamburgerMenu () {
      this.isHamburgerOpen = !this.isHamburgerOpen
    },

    async send () {
      //this.setActiveChannel('general')
      //console.log(this.activeChannel)

      let isCommand = false
      if(this.newMessageText[0] === '/')
        isCommand = true

      if(isCommand){
        console.log('Command found: ' + this.newMessageText)
        console.log("While channel active is: " + this.activeChannel)
        if(this.newMessageText == '/cancel' && this.activeChannel != null)
          this.leaveChannel(this.activeChannel)
      }

      if(this.activeChannel != null && !isCommand){
        this.loading = true
        await this.addMessage({ channel: this.activeChannel, message: this.newMessageText })
        this.newMessageText = ''
        this.loading = false
      }else{
        this.newMessageText = ''
      }
    },
    ...mapMutations('channels', {
      setActiveChannel: 'SET_ACTIVE'
    }),
    ...mapActions('auth', ['logout']),
    ...mapActions('channels', ['addMessage','leaveChannel']),
    isMine (message: SerializedMessage): boolean {
      return message.author.id === this.currentUser
    },
    scrollMessages () {
      const area = this.$refs.chatArea as QScrollArea
      area && area.setScrollPercentage('vertical', 1.1)
    },
    getColor (message: SerializedMessage): string {
      if (this.isUserTagged(message.content)) return 'secondary'
      if (this.isMine(message)) return 'primary'
      else return 'grey-4'
    },
    getAuthorPicture () {
      //   message: SerializedMessage
      //   console.log('Looking for pic of user:' + message.author.id)
      const picture = 'https://cdn.quasar.dev/img/avatar5.jpg' // TODO change this from static
      return picture
    }
  },
  setup () {
    //
  }
})
</script>


<style scoped>
.mentionedMessage{
  border: 2px solid red;
}
</style>