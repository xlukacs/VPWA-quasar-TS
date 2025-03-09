<template>
    <q-dialog v-model="showErrorPrompt" persistent>
        <q-card>
            <q-card-section class="row items-center">
                <q-avatar icon="error" color="primary" text-color="white" />
                <span class="q-ml-sm">{{ errorMessage }}</span>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="Close" color="primary" @click="closePopup" />
            </q-card-actions>
        </q-card>
    </q-dialog>
  </template>
  
  <script>
  import { defineComponent } from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  
  export default defineComponent({
    name: 'ErrorPrompt',
    data(){
      return {
        showErrorPrompt: false
      }
    },
    computed: {
      ...mapGetters('user', {
        errorMessage: 'getErrorMessage'
      }),
    },
    watch: {
        errorMessage(newVal, oldVal){
            if(newVal != '')
                this.showErrorPrompt = true
        }
    },
    methods: {
        ...mapActions('user', ['clearErrorMessage']),
        closePopup(){
            this.clearErrorMessage()
            this.showErrorPrompt = false
        }
    }
  })
  </script>
  