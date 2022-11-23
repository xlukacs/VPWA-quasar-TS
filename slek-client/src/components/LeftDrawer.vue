<template>
  <q-list>
    <q-item
      v-for="channel in channels"
      :key="channel.index"
      clickable
      v-ripple
      @click="setActiveChannel(channel.name)"
    >
      <q-item-section avatar>
        <q-avatar
          rounded
          color="orange"
          text-color="white"
          icon="group"
        ></q-avatar>
      </q-item-section>
      <q-item-section>{{ channel.name }}</q-item-section>
      <q-item-section>{{ lastMessageOf(channel.name)?.content || 'Placeholder text...' }}</q-item-section>
    </q-item>
    <q-btn color="primary" icon="check" label="Refresh" @click="populateChannelList" />

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
          <q-input filled v-model="color" class="channel-color-picker q-mt-md">
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-color v-model="color"></q-color>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>

        <q-card-section>
          <q-btn color="secondary" icon="save" label="Create channel" @click="createChannel"></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import { mapMutations, mapGetters, mapActions } from 'vuex'

export default defineComponent({
  name: 'LeftDrawer',
  setup () {
    return {
      newChannelName: '',
      newChannelVisibility: null,
      createChannel: false,
      channelEditor: false,
      options: ['Public', 'Private'],
      color: ref('#2d49e3'),
      secondColor: ref('#027be3'),
      openedChannel: {
        index: 0,
        name: 'Channel X'
      },
      loading: false
    }
  },
  computed: {
    ...mapGetters('channels', {
      channels: 'joinedChannels',
      lastMessageOf: 'lastMessageOf'
    }),
  },
  methods: {
    ...mapMutations('channels', {
      setActiveChannel: 'SET_ACTIVE'
    }),
    ...mapActions('channels', ['populateChannelList', 'addChannel']),
    async createChannel(){
      this.loading = true
      this.addChannel({name: })
      this.loading = false
    }
  },
  beforeMount () {
    this.populateChannelList()

    // setTimeout(() => {
    //   console.log('CHANNEL LIST')
    //   console.log(this.channels);
    // }, 500);
  }
})
</script>
