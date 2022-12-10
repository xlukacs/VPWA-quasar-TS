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
            <img :src="userPic" />
          </q-avatar>
          {{ loggedInUserName }}
          <q-icon name="fiber_manual_record" :color="statusColor(statuses[currentUser])"></q-icon>
          <q-btn-dropdown flat color="primary" label="Status">
            <q-list>
              <q-item clickable v-close-popup  @click="setStatus('online')">
                <q-item-section>
                  <q-item-label>Online</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="fiber_manual_record" color="green"></q-icon>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup  @click="setStatus('dnd')">
                <q-item-section>
                  <q-item-label>DND</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="fiber_manual_record" color="yellow"></q-icon>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup  @click="setStatus('offline')">
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

        <div class="col-md-9 row items-center justify-end">
          <q-btn @click="logMeOut()" label="Log out" class="bg-negative"></q-btn>
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
                  <q-item clickable v-close-popup @click="setStatus('online')">
                    <q-item-section>
                      <q-item-label>Online</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="fiber_manual_record" color="green"></q-icon>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="setStatus('dnd')">
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
                  <q-item clickable v-close-popup @click="setStatus('offline')">
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
            <div class="col-12 row items-center justify-end">
              <q-btn @click="logMeOut()" label="Log out" class="bg-negative"></q-btn>
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
      <span v-if="!activeChannel" class="hologram q-pa-md">
        This is the default lobby. To proceed please join a channel from the list. <br>
        Forher available commands:
        <ul>
          <li>/list - show users in channel</li>
          <li>/join [channel name] - join channel</li>
          <li>/status [online | offline | dnd] - work in progress</li>
        </ul>
      </span>

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

  <!-- Dialogs -->
  <!-- <q-dialog v-model="showUsersInChatDialog" persistent>
    <q-card>
      <q-bar>
          <q-icon :name="getChannelStatus"></q-icon>
          <div>{{ activeChannel }}</div>
          <q-space></q-space>

          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>
      <q-card-section class="row items-center">
        <q-list dense>
          <q-item clickable v-ripple v-for="user in usersInChat">
            <q-item-section avatar>
              <q-avatar>
                <img :src="user.picName" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <div class="row">
                <div class="col-10">
                  <div
                    class="row no-wrap justify-start items-center"
                    style="height: 100%"
                  >
                    <span text-color="primary">{{ user.username }}</span>
                    <q-icon name="star" color="blue" v-if="user.id == channelOwner"></q-icon>
                    <q-icon name="fiber_manual_record" :color="statusColor(user.status)"></q-icon>
                  </div>
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog> -->

  <ErrorPrompt />
</template>

<script lang="ts">
import { SerializedMessage } from 'src/contracts'
import { defineComponent, ref } from 'vue'
import LeftDrawer from 'src/components/LeftDrawer.vue'
import RightDrawer from '../components/RightDrawer.vue'
import { Dimension } from '../components/models'
import { mapActions, mapGetters, mapMutations, useStore } from 'vuex'
import { QScrollArea } from 'quasar'
import { api } from 'src/boot/axios'
import ErrorPrompt from 'src/components/ErrorPrompt.vue'

export default defineComponent({
  components: { LeftDrawer, RightDrawer, ErrorPrompt },
  name: 'ChannelPage',
  computed: {
    messages (): SerializedMessage[] {
      return this.$store.getters['channels/currentMessages']
    },
    ...mapGetters('channels', {
      channels: 'joinedChannels',
      lastMessageOf: 'lastMessageOf',
      usersInChat: 'getUsersInActiveChat',
      channelOwner: 'getChannelCreator',
      activeChannel: 'getActiveChannelName',
      privateChannel: 'getChannelVisibility',
      statuses: 'getStatuses'
    }),
    ...mapGetters('auth', {
      loggedInUserName: 'getUserName',
      userPic: 'getUserPic'
    }),
    ...mapGetters('user', {
      userStatus: 'getStatus',
    }),
    activeChannel () {
      return this.$store.state.channels.active
    },
    currentUser () {
      return this.$store.state.auth.user?.id
    },
    getCurrentUser () {
      return this.$store.state.auth.user
    },
    getChannelStatus(){
      return this.$store.state.channels.activeChannel?.isPublic ? 'group' : 'lock';
    }
  },
  watch: {
    messages: {
      handler () {
        this.$nextTick(() => this.scrollMessages())
      },
      deep: true
    },
    userStatus(newVal, oldVal){
      if(newVal == 'online')
        this.userStatusColor = 'green'
      else if(newVal == 'offline')
        this.userStatusColor = 'red'
      else if(newVal == 'dnd')
        this.userStatusColor = 'yellow'
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
      typingCount: 0,

      showUsersInChatDialog: false,
      userStatusColor: 'green'
    }
  },
  methods: {
    logMeOut(){
      this.logout()
    },
    statusColor(status: string){
      if(status == 'online')
        return 'green'
      else if(status == 'offline')
        return 'red'
      else if(status == 'dnd')
        return 'yellow'
      else
        return 'orange'
    },  
    selectStatus(status: string){
      this.setStatus(status)
    },
    async tryJoin(channel: string){
      const user = this.$store.state.auth.user
      const payload = {
        channel: channel,
        user: user?.username
      }
      try {
        const isPublic = await api.get('channels/getChannelVisibility', { params: payload })
        console.log(isPublic)
        
        if(isPublic.data || this.channelOwner == user?.id){
          this.setActiveChannel(channel)
        }else{
          this.setError('Cant join a private channel without invitation!')
        }
      } catch (error) {
        let newChannel = { name: channel, color: 'primary', isPublic: true, owner: this.$store.state.auth.user?.id, valid: true }
        this.addChannel(newChannel).then(() => {
          this.setActiveChannel(channel)
        })
      }

    },
    inviteUserToChannel(user: string){
      this.inviteUser({channel: this.activeChannel, user: user})
      this.setError('User ' + user + ' has been invited to channel: ' + this.activeChannel)
    },
    isUserTagged (message:string) {
      const words = message.split(' ')
      const ownMentionTag = '#' + this.$store.state.auth.user?.username

      let found = false
      words.forEach(word => {
        if (word == ownMentionTag && !found){
          found = true
        }
      })

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
        const splitted = this.newMessageText.split(' ')
        if(splitted[0] == '/cancel' && this.activeChannel != null){
          this.leaveChannel(this.activeChannel)
        }else if (splitted[0] == '/cancel' && this.activeChannel == null){
          this.setError('First join a channel, to be able to leave one.')
        }
        else if(splitted[0] == '/list' && this.activeChannel != null){
          this.showUsersInChat()
        }else if(splitted[0] == '/list' && this.activeChannel == null){
          this.setError('Cant list user without an active channel.')
        }
        else if(splitted[0] == '/invite' && this.activeChannel != null && !this.privateChannel){
          this.inviteUserToChannel(splitted[1])
        }
        else if(splitted[0] == '/join'){
          this.tryJoin(splitted[1])
        }
        else if(splitted[0] == '/status' && (splitted[1] == 'online' || splitted[1] == 'offline' ||splitted[1] == 'dnd')){
          this.setStatus(splitted[1])
        }
        else
          this.setError('Unknown command or unknown format.')
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
    // ...mapMutations('channels', {
    //   setActiveChannel: 'SET_ACTIVE'
    // }),
    ...mapActions('auth', ['logout']),
    ...mapActions('channels', ['addMessage','leaveChannel', 'inviteUser', 'setStatus','addChannel','setActiveChannel']),
    ...mapActions('user', ['setError', 'loadStatus']),
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
      const picture = 'https://cdn.quasar.dev/img/avatar5.jpg' // TODO change this from static
      return picture
    },
    showUsersInChat(){
      this.showUsersInChatDialog = true
    },
    fetchUserStatus(){
      this.loadStatus()
    }
  },
  setup () {
    // const store = useStore()
    // return {
    //   selectStatus: (status: string) => {
    //     console.log(status)
    //     store.dispatch('setStatus', status)
    //   }
    // }
  },
  mounted() {
    this.fetchUserStatus()
  }
})
</script>


<style scoped>
.mentionedMessage{
  border: 2px solid red;
}
.hologram{
  position: absolute;
  z-index: 1001;
}
</style>
