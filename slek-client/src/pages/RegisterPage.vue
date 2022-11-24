<template>
  <div class="row full-width justify-center" style="height: 100vh">
    <div
      class="col-4 self-center bg-primary q-pa-sm rounded-borders text-center"
    >
      <h3 style="text-align: center; font-weight: bold">Register</h3>
      <!-- <q-input rounded standout v-model="form.username" label="Username"></q-input> -->
      <q-input
        rounded
        standout
        v-model.trim="form.email"
        type="email"
        label="Email"
        class="q-mt-md"
      ></q-input>
      <q-input
        rounded
        standout
        type="text"
        v-model="form.username"
        label="Username"
        class="q-mt-md"
      ></q-input>
      <q-input
        rounded
        standout
        type="password"
        v-model="form.password"
        label="Password"
        class="q-mt-md"
      ></q-input>
      <q-input
        rounded
        standout
        type="password"
        v-model="form.passwordConfirmation"
        label="Password confirmation"
        class="q-mt-md"
      ></q-input>
      <q-btn
        :loading="loading"
        @click="onSubmit"
        color="blue-6"
        label="Register"
        class="q-mt-md"
      ></q-btn>
      <q-btn
        :to="{ name: 'login' }"
        label="Allready registered?"
        class="q-mt-md q-ml-sm bg-secondary"
      ></q-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouteLocationRaw } from 'vue-router'

export default defineComponent({
  name: 'RegisterPage',
  data () {
    return {
      form: { email: '', password: '', passwordConfirmation: '', username: '' },
      showPassword: false
    }
  },
  computed: {
    redirectTo (): RouteLocationRaw {
      return { name: 'login' }
    },
    loading (): boolean {
      return this.$store.state.auth.status === 'pending'
    }
  },
  methods: {
    onSubmit () {
      this.$store.dispatch('auth/register', this.form).then(() => this.$router.push(this.redirectTo))
    }
  }
})
</script>
