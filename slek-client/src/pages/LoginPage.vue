<template>
  <div class="row full-width justify-center" style="height: 100vh">
    <div
      class="col-4 self-center bg-primary q-pa-sm rounded-borders text-center"
    >
      <h3 style="text-align: center; font-weight: bold">Login</h3>
      <q-input rounded standout v-model.trim="credentials.email" label="Email" type="email"></q-input>
      <q-input
        rounded
        standout
        type="password"
        v-model="credentials.password"
        label="Password"
        class="q-mt-md"
      ></q-input>
      <q-btn
        :loading="loading"
        @click="onSubmit"
        color="blue-6"
        label="Log in"
        class="q-mt-md"
      ></q-btn>
      <q-btn
        :to="{ name: 'register' }"
        label="Dont have and account?"
        class="q-mt-md q-ml-sm bg-secondary"
      ></q-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouteLocationRaw } from 'vue-router'

export default defineComponent({
  name: 'LoginPage',
  data () {
    return {
      credentials: { email: '', password: '', remember: false },
      showPassword: false
    }
  },
  computed: {
    redirectTo (): RouteLocationRaw {
      return (this.$route.query.redirect as string) || { name: 'home' }
    },
    loading (): boolean {
      return this.$store.state.auth.status === 'pending'
    }
  },
  methods: {
    onSubmit () {
      this.$store.dispatch('auth/login', this.credentials).then(() => this.$router.push(this.redirectTo))
    }
  }
})
</script>
