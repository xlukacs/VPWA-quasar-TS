<template>
    <channel-messages-component :messages="messages" />
  </template>
  
  <script lang="ts">
  import ChannelMessagesComponent from 'src/components/ChannelMessagesComponent.vue'
  import { SerializedMessage } from 'src/contracts'
  import { defineComponent, PropType } from 'vue'
  
  export default defineComponent({
    name: 'ChannelTextingComponent',
    computed: {
      messages (): SerializedMessage[] {
        return this.$store.getters['channels/currentMessages']
      }
    }
  })
  </script>
  