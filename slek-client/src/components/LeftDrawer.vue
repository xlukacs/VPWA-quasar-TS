<template>
  <q-list>
    <q-item
      :class="activeChannel == channel.name ? 'bg-info' : ''"
      v-for="channel in channels"
      :key="channel.index"
      clickable
      v-ripple
      @click="setActiveChannel(channel.name)"
    >
      <q-item-section avatar>
        <q-avatar
          rounded
          :color="channel.color"
          text-color="white"
          :icon="channel.isPublic ? 'group' : 'lock'"
        ></q-avatar>
      </q-item-section>
      <q-item-section>{{ channel.name }}</q-item-section>
      <q-item-section v-if="channel.valid">{{ lastMessageOf(channel.name)?.content || 'Placeholder text...' }}</q-item-section>
      <q-item-section v-if="!channel.valid">
        <q-btn color="primary" dense icon="check" label="Accept" @click="acceptInvitation(channel.name)" />
        <q-btn color="negative" dense icon="close" class="q-mt-xs" label="Deny" @click="denyInvitation(channel.name)" />
      </q-item-section>
    </q-item>

    <!-- Channel editor dialog -->
    <q-dialog v-model="channelEditor">
      <q-card>
        <q-toolbar>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo.svg" />
          </q-avatar>

          <q-toolbar-title
            ><span class="text-weight-bold">Channel X</span>
            settings</q-toolbar-title
          >

          <q-btn flat round dense icon="close" v-close-popup></q-btn>
        </q-toolbar>

        <q-card-section>
          <q-input
            rounded
            standout
            v-model="openedChannel.name"
            label="Current channel name"
          ></q-input>
          <q-btn
            flat
            dense
            class="bg-secondary q-mt-sm"
            icon="save"
            v-close-popup
            >Save settings</q-btn
          >
          <q-btn
            flat
            dense
            class="bg-negative q-mt-sm q-ml-sm"
            icon="close"
            v-close-popup
          >
            Delete channel</q-btn
          >
          <!-- TODO Maybe a prompt before delete would be nice -->
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-list>

  <div class="row justify-center q-mt-md">
    <q-btn
      color="primary"
      icon="add"
      label="Create channel"
      @click="createChannel = true"
    ></q-btn>

    <!-- Channel creation dialog -->
    <q-dialog
      v-model="createChannel"
      persistent
      transition-show="flip-down"
      transition-hide="flip-up"
    >
      <q-card class="bg-primary text-white">
        <q-bar>
          <q-icon name="create"></q-icon>
          <div>Create channel</div>

          <q-space></q-space>

          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-pt-md column justify-center">
          <q-input standout v-model="newChannelName" label="Channel name"></q-input>
          <q-select
            standout
            v-model="newChannelVisibility"
            :options="options"
            label="Visibility"
            class="q-mt-md"
          ></q-select>
          <q-select
            standout
            v-model="newChannelColor"
            :options="colorOptions"
            label="Channel color"
            class="q-mt-md"
          ></q-select>
        </q-card-section>

        <q-card-section>
          <q-btn color="secondary" icon="save" label="Create channel" @click="createChannelMethod"></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { api } from 'src/boot/axios'
import { ref, defineComponent } from 'vue'
import { mapMutations, mapGetters, mapActions } from 'vuex'

export default defineComponent({
  name: 'LeftDrawer',
  setup () {
    return {
      channelEditor: false,
      options: ['Public', 'Private'],
      colorOptions: ['Red', 'Green', 'Blue', 'Orange'],
      color: ref('#2d49e3'),
      secondColor: ref('#027be3'),
      openedChannel: {
        index: 0,
        name: 'Channel X'
      },
      loading: false,
    }
  },
  data() {
    return {
      createChannel: false,
      newChannelName: '',
      newChannelVisibility: null,
      newChannelColor: null
    }
  },
  computed: {
    ...mapGetters('channels', {
      channels: 'joinedChannels',
      lastMessageOf: 'lastMessageOf',
      activeChannel: 'getActiveChannelName'
    }),
  },
  methods: {
    // ...mapMutations('channels', {
    //   setActiveChannel: 'SET_ACTIVE'
    // }),
    async acceptInvitation(channelName: string){
      console.log(channelName)
      const payload = { channel: channelName, user: this.$store.state.auth.user?.username }

      await api.get('channels/acceptInvitation', { params: payload }).then(() => this.populateChannelList()).then(() => this.setActiveChannel(channelName))
    },
    async denyInvitation(channelName: string){
      console.log(channelName)
      const payload = { channel: channelName, user: this.$store.state.auth.user?.username }

      await api.get('channels/denyInvitation', { params: payload }).then(() => this.populateChannelList()).then(() => this.setActiveChannel('general'))
      
    },
    ...mapActions('channels', ['populateChannelList', 'addChannel', 'setActiveChannel']),
    async createChannelMethod(){
      this.loading = true

      let canBePublic = false
      if(this.newChannelVisibility == 'Public')
        canBePublic = true

      let newChannelThemeColor = 'orange';
      if(this.newChannelColor == 'Red')
        newChannelThemeColor = "red-7";
      if(this.newChannelColor == 'Green')
        newChannelThemeColor = "green-7";
      if(this.newChannelColor == 'Blue')
        newChannelThemeColor = "primary";

      let channel = { name: this.newChannelName, color: newChannelThemeColor, isPublic: canBePublic, owner: this.$store.state.auth.user?.id, valid: true }
      this.addChannel(channel)
      this.loading = false

      this.createChannel = false
    },
    testFunc () {
      console.log(this.createChannel)
    }
  },
  beforeMount () {
    this.populateChannelList()
  }
})
</script>
