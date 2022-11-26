<template>
  <div class="row items-center">
    <div class="col-8">
      <h5 class="q-ma-sm">{{ activeChannel.name  }}</h5>
    </div>
    <div class="col" v-if="(channelOwner != undefined && !hideTopNavigator)">
      <q-btn
        v-if="ownId == channelOwner"
        dense
        color="negative"
        icon="delete"
        label="Delete"
        @click="closeCurrentChannel"
      />
      <q-btn
        v-if="ownId != channelOwner"
        dense
        color="negative"
        icon="logout"
        label="Leave"
        @click="leaveCurrentChannel"
      />
    </div>
  </div>
  <div class="row q-mb-sm q-mt-md">
    <div class="col-12">
      <q-input dense disable standout rounded label="Search for user...">
        <template v-slot:append>
          <q-icon name="search" color="blue"></q-icon>
        </template>
      </q-input>
    </div>
  </div>
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
              <!-- <q-icon name="person" color="blue"></q-icon> -->
            </div>
          </div>
          <!-- <div class="col-2">
                      <q-btn dense flat round color="primary" icon="settings" @click="userSettingsPopup = true"></q-btn>
                  </div> -->
       </div>
      </q-item-section>
    </q-item>

    <!-- <q-item clickable v-ripple>
      <q-item-section avatar>
        <q-avatar>
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <div class="row">
          <div class="col-10">
            <div
              class="row no-wrap justify-start items-center"
              style="height: 100%"
            >
              <span text-color="primary">User 1</span>
              <q-icon name="star" color="blue"></q-icon>
              <q-icon name="person" color="blue"></q-icon>
            </div>
          </div> -->
          <!-- <div class="col-2">
                      <q-btn dense flat round color="primary" icon="settings" @click="userSettingsPopup = true"></q-btn>
                  </div> -->
       <!--  </div>
      </q-item-section>
    </q-item>
    <q-item clickable v-ripple>
      <q-item-section avatar>
        <q-avatar>
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <div class="row">
          <div class="col-10">
            <div
              class="row no-wrap justify-start items-center"
              style="height: 100%"
            >
              <span text-color="primary">User 2</span>
              <q-icon name="star" color="blue"></q-icon>
            </div>
          </div>
          <div class="col-2">
            <q-btn
              dense
              flat
              round
              color="primary"
              icon="settings"
              @click="userSettingsPopup = true"
            ></q-btn>
          </div>
        </div>
      </q-item-section>
    </q-item>
    <q-item clickable v-ripple>
      <q-item-section avatar>
        <q-avatar>
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <div class="row">
          <div class="col-10">
            <div
              class="row no-wrap justify-start items-center"
              style="height: 100%"
            >
              <span text-color="primary">User 3</span>
            </div>
          </div>
          <div class="col-2">
            <q-btn
              dense
              flat
              round
              color="primary"
              icon="settings"
              @click="userSettingsPopup = true"
            ></q-btn>
          </div>
        </div>
      </q-item-section>
    </q-item>
    <q-item clickable v-ripple>
      <q-item-section avatar>
        <q-avatar>
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <div class="row">
          <div class="col-10">
            <div
              class="row no-wrap justify-start items-center"
              style="height: 100%"
            >
              <span text-color="primary">User 4</span>
            </div>
          </div>
          <div class="col-2">
            <q-btn
              dense
              flat
              round
              color="primary"
              icon="settings"
              @click="userSettingsPopup = true"
            ></q-btn>
          </div>
        </div>
      </q-item-section>
    </q-item>
    <q-item clickable v-ripple>
      <q-item-section avatar>
        <q-avatar>
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <div class="row">
          <div class="col-10">
            <div
              class="row no-wrap justify-start items-center"
              style="height: 100%"
            >
              <span text-color="primary">User 5</span>
            </div>
          </div>
          <div class="col-2">
            <q-btn
              dense
              flat
              round
              color="primary"
              icon="settings"
              @click="userSettingsPopup = true"
            ></q-btn>
          </div>
        </div>
      </q-item-section>
    </q-item> -->
  </q-list>
  <q-dialog v-model="userSettingsPopup">
    <q-card>
      <q-toolbar>
        <q-avatar>
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
        </q-avatar>

        <q-toolbar-title
          ><span class="text-weight-bold">Username </span>
          options</q-toolbar-title
        >

        <q-btn flat round dense icon="close" v-close-popup></q-btn>
      </q-toolbar>

      <q-card-section>
        <q-btn flat dense class="bg-negative" icon="report" v-close-popup
          >Report user</q-btn
        >
        <q-btn
          v-if="isUserModerator"
          flat
          dense
          class="bg-negative q-ml-sm"
          icon="person_remove"
          v-close-popup
        >
          Kick user</q-btn
        >
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineComponent } from 'vue'
import { mapMutations, mapGetters, mapActions } from 'vuex'

export default defineComponent({
  name: 'RightDrawer',
  setup () {
    return {
      userSettingsPopup: ref(false)
    }
  },
  data(){
    return {
      isUserModerator: false,
      ownId: 0,
      hideTopNavigator: false
    }
  },
  computed: {
    ...mapGetters('channels', {
      channelOwner: 'getChannelCreator',
      activeChannel: 'getActiveChannel',
      activeChannelName: 'getActiveChannelName',
      usersInChat: 'getUsersInActiveChat'
    }),
  },
  watch: {
    activeChannelName(oldVal, newVal){

      if(oldVal != null && oldVal != undefined && oldVal != '')
        this.hideTopNavigator = false

        //console.log('NOw it is: ', this.hideTopNavigator)
    },
    channelOwner(newVal, oldVal){
      //console.log(newVal + '-' + oldVal)
      //console.log(this.usersInChat)
    }
  },
  mounted(){
    // console.log(this.channelOwner)
    // this.isUserModerator = this.$store.state.auth.user?.id == this.$store.state.channels.activeChannel.owner ? true : false
    this.ownId = this.$store.state.auth.user?.id
  },
  methods: {
    ...mapMutations('channels', {
      setActiveChannel: 'SET_ACTIVE'
    }),
    ...mapActions('channels', ['closeChannel','leaveChannel','join']),
    leaveCurrentChannel(){
      //TODO prompt
      console.log(this.activeChannelName)
      this.leaveChannel(this.activeChannelName)
    
      setTimeout(() => {
        this.setActiveChannel('general')
      }, 200);
    },
    closeCurrentChannel(){
      //TODO prompt
      console.log(this.activeChannelName)
      this.closeChannel(this.activeChannelName)

      setTimeout(() => {
        this.setActiveChannel('general')
      }, 200);
    }
  }
})
</script>
